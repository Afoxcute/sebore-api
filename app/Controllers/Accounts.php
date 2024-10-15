<?php namespace App\Controllers;

use CodeIgniter\Controller;

use App\Models\AccountModel;
use App\Models\Auth_clientModel;
use App\Models\Auth_tokenModel;
use App\Models\CompanyModel;
use App\Models\GenericModel;
use App\Models\NotificationModel;
use App\Models\SystemAuditModel;
use App\Models\UserModel;
use App\Models\UtilityModel;
use App\Models\ValidateSessionModel;

class Accounts extends BaseController
{
	function __construct()
	{
		// Create objects of the required models
		$this->account = new AccountModel();
		$this->auth_client = new Auth_clientModel();
		$this->auth_token = new Auth_tokenModel();
		$this->company = new CompanyModel();
        $this->generic = new GenericModel();
		$this->notification = new NotificationModel();
		$this->audit = new SystemAuditModel();
		$this->user = new UserModel();
		$this->utility = new UtilityModel();
		$this->sessionValidate = new ValidateSessionModel();
		// Set the HTTP Request object
		$this->request = \Config\Services::request();
		// Set the HTTP Response object
		$this->response = \Config\Services::response();
		// To set the output content types when the request is an ajax request
		// if($this->request->isAJAX())
		// {
			$this->response->setHeader('Access-Control-Allow-Origin', '*');
			$this->response->setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
			$this->response->setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
			$this->response->setHeader('Content-type', 'application/json');
			$this->response->setHeader('Cache-Control', 'no-cache, must-revalidate');
			
		// }
		// Set the X-Frame-Options header
		//$this->response->setHeader('X-Frame-Options', 'SAMEORIGIN');
		// Get the user agent and make it available globally
        $this->agent = $this->request->getUserAgent();
        // Create a curl object for ready use
		$this->client = \Config\Services::curlrequest();
		// Get any filter parameters 
		$this->filterparams['lastname'] = $this->request->getGetPost('lastname');
	}

	// Controller default landing end-point
	public function index()
	{
        $response = ["status"=>"success", 'message'=>'API end-points for managing accounts'];
        // Return the output as a JSON object
		return $this->response->setJSON($response);
    }

    // Controller end-point to create an account
	public function create()
	{
		// Verify the client access to this API
		$verification = $this->auth_client->verifyClient($this->request);
		if($verification['status'] == 'failed'){
			return $this->response->setJSON($verification);
		}
		// Fetch the account input data first
		$_data_input = $this->account->getSignUpInputs($this->request, $this->utility, $this->company, $this->user);
		// Ensure no input error
		if($_data_input['status'] == 'success'){
			// Initiate a transaction
			$this->db->transStart();
			// Now create the account
			$_data_input['company']['account_id'] = $this->generic->add($_data_input['account'], 'accounts');
			// Create the company
			$_data_input['user']['company_id'] = $this->generic->add($_data_input['company'], 'companies');
			// Create the user login and make the master account
			$_data_input['user']['password'] = password_hash($_data_input['user']['password'], PASSWORD_BCRYPT);
			$_data_input['user']['master_account'] = 1;
			$_data_input['user']['user_role_id'] = 4000002;
			$_data_input['user']['account_id'] = $_data_input['company']['account_id'];
			$this->generic->add($_data_input['user'], 'users');
			// Create an activation record
			$activation_token = $this->utility->generateCode();
			$this->generic->add(['account_id'=>$_data_input['company']['account_id'], 'activation_token'=>$activation_token], 'account_activations');
			// Complete the transaction
			$this->db->transComplete();
			// Set the activation token and account ids
			$_data_input['account']['activation_token'] = $activation_token;
			$_data_input['account']['account_id'] = $_data_input['company']['account_id'];
			// Generate and send an activation email to the user
			$email_message = view('email_views/email-activation', $_data_input['account']);
			$this->notification->sendMailByMailgun($email_message, 'Activate Your Account', $_data_input['account']['email']);
			// Call method to create a superadmin user for the company
			// Return the required output
			return $this->response->setJSON(['status'=>'success', 'code'=>200, 'message'=>'Account sign up was successful. Please activate your account.']);
		}
		else{
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
			// Return the required output
			return $this->response->setJSON($_data_input);
		}
    }
    
    // Controller end-point to edit an account
	public function edit($id=NULL)
	{
        // Validate the user's session before proceeding
		$validSession = $this->auth_token->validateTokenAccess('ACCOUNTS_EDIT', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
        }
        // Fetch the input data
	}

	// Controller to sign up a new merchant
	public function get($id=NULL)
	{
        // Validate the user's session before proceeding
		$validSession = $this->auth_token->validateTokenAccess('ACCOUNTS_INDEX', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}
		// Process any required filters
		$this->filterparams = $this->auth_token->addTokenFilter($this->filterparams, $validSession['token_data']);
		// Get method to fetch the data
		$this->filterparams['id'] = $id;
		// Fetch any limits or offset from the db
		$offset = ($this->request->getGet('offset') == '') ? 0 : $this->request->getGetPost('offset');
        $limit = ($this->request->getGet('limit') == '') ? 10 : $this->request->getGetPost('limit');
		// Call method to fetch the list of accounts
		$records = $this->account->getAll($this->filterparams, $offset, $limit);
		// Get total available records
		$records_count = $this->account->getAllCount($this->filterparams);
		// Prepare the response array
		$_data = ['status'=>'success', 'draw' => 0, 'recordsFiltered' => $records_count, 'recordsTotal' => $records_count, 'data' => $records];
		// Return the response
		return $this->response->setJSON($_data);
    }

    // Controller method to resend a user's activation link
    public function resend_activation()
    {
		// Verify the client access to this API
		$verification = $this->auth_client->verifyClient();
		if($verification['status'] == 'failed'){
			return $this->response->setJSON($verification);
		}
		// Get the email from the request
        $email = $this->request->getPost('email');
        // Now get the merchant whose activation needs to be resent
        $_account = $this->generic->getByFieldSingle('email', $email, 'accounts'); // account_activations
        if(is_array($_account) && !empty($_account)){
            // Notify the user of the account creations
			$email_message = $this->merchant->getActivateEmailMessage($_account['firstname'], $_account['email_verification_code'], $_account['id']);
			// send the email
			$this->notification->sendEmail($email_message, $_account['email'], "Account Activation Required", "", NULL, true);
			// Load the success message
			$response = array("status"=>"success", 'message'=>'Activation email has been resent successfully');
        }
        else{
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
            // Load the response message
            $response = array("status"=>"failed", 'message'=>'This action is not allowed');
        }
        // Re-generate a new CSRF token for the next request
		$response['csrf_token'] = csrf_hash();
		// Return the output as a JSON object
		return $this->response->setJSON($response);
    }

    // Controller method to resend a user's activation link
    public function activate($id, $activation_token)
    {
        // Now get the merchant whose activation needs to be resent
        $_data = $this->account->getAccountActivation($id);
        if(is_array($_data) && !empty($_data) && $_data['activation_token'] == $activation_token){
			// Set the account as activated
			$this->generic->edit(['account_status'=>1], $_data['account_id'], 'accounts');
			// Close the activation token record
			$this->generic->edit(['activated'=>1], $_data['id'], 'account_activations');
			// Update the user account also
			$this->generic->editByConditions(['user_status'=>1], ['account_id' => $_data['account_id'], 'master_account'=>1], 'users');
            // Generate and send an activation completion email to the user
			$email_message = view('email_views/email-activated', $_data);
			$this->notification->sendMailByMailgun($email_message, 'Your Account Has Been Activated', $_data['email']);
			echo "Your account has been activated successfully. You can now login into your account";
			// Redirect to the main app
			return redirect()->to('https://yaraa.io/login/index/activated');
        }
        else{
			// Set the HTTP status code required
			//$this->response->setStatusCode(400);
			echo "This action is not allowed";
			return redirect()->to('https://yaraa.io/login/index/not_allowed');
        }
    }
}