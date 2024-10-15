<?php namespace App\Controllers;

use CodeIgniter\Controller;

use App\Models\Auth_clientModel;
use App\Models\Auth_tokenModel;
use App\Models\GenericModel;
use App\Models\LoginModel;
use App\Models\NotificationModel;
use App\Models\Role_assignmentModel;
use App\Models\SystemAuditModel;
use App\Models\UserModel;
use App\Models\User_roleModel;
use App\Models\UtilityModel;
use App\Models\ValidateSessionModel;

class Users extends BaseController
{
	function __construct()
	{
		// Create objects of the required models
		$this->auth_client = new Auth_clientModel();
		$this->auth_token = new Auth_tokenModel();
		$this->generic = new GenericModel();
		$this->notification = new NotificationModel();
		$this->roleAssignment = new Role_assignmentModel();
		$this->audit = new SystemAuditModel();
		$this->user = new UserModel();
		$this->userRole = new User_roleModel();
		$this->utility = new UtilityModel();
		$this->sessionValidate = new ValidateSessionModel();
		
		// Set the HTTP Request object
		$this->request = \Config\Services::request();
		// Set the HTTP Response object
		$this->response = \Config\Services::response();
		// To set the output content types when the request is an ajax request
		if($this->request->isAJAX())
		{
			$this->response->setHeader('Content-type', 'application/json');
			$this->response->setHeader('Access-Control-Allow-Origin', '*');
			$this->response->setHeader('Cache-Control', 'no-cache, must-revalidate');
		}
		// Set the X-Frame-Options header
		$this->response->setHeader('X-Frame-Options', 'SAMEORIGIN');
		// Get the user agent and make it available globally
		$this->agent = $this->request->getUserAgent();

		// Get any filter options for this page call
		$this->filterparams['userroleid'] = $this->request->getGetPost('userroleid');
		$this->filterparams['branch_id'] = $this->request->getGetPost('branch_id');
		$this->filterparams['search'] = $this->request->getGet('search[value]');
		$this->filterparams['term'] = $this->request->getGetPost('term');
		$this->filterparams['user_status'] = $this->request->getGetPost('user_status');
		
		// Class-wide sub-title text
		$this->page_sub_header = 'User management. Create, edit, delete and approve users';
		$this->page_icon_class = 'pe-7s-user-female icon-gradient bg-ripe-malin';
	}

	// Controller to sign up a new merchant
	public function get($id=NULL)
	{
        // Validate the user's session before proceeding
		$validSession = $this->auth_token->validateTokenAccess('USERS_INDEX', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}
		// Process any required filters
		$this->filterparams = $this->auth_token->addTokenFilter($this->filterparams, $validSession['token_data']);
		// Get method to fetch the data
		$this->filterparams['user_id'] = $id;
		// Fetch any limits or offset from the db
		$offset = ($this->request->getGet('offset') == '') ? 0 : $this->request->getGetPost('offset');
        $limit = ($this->request->getGet('limit') == '') ? 10 : $this->request->getGetPost('limit');
		// Call method to fetch the list of accounts
		$records = $this->user->getAll($this->filterparams, $offset, $limit);
		// Get total available records
		$records_count = $this->user->getAllCount($this->filterparams);
		// Prepare the response array
		$_data = ['status'=>'success', 'draw' => 0, 'recordsFiltered' => $records_count, 'recordsTotal' => $records_count, 'data' => $records];
		// Return the response
		return $this->response->setJSON($_data);
    }

	// Controller function to create a new user
	function create()
	{
		// Validate the user's session before proceeding
		$validSession = $this->auth_token->validateTokenAccess('USERS_CREATE', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}
		// Get the edit inputs
		$_input_response = $this->user->getFormInput($this->request, $this->utility);
		// Perform a selection of success or failed
		if ($_input_response['status'] == "failed")
		{
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
			// Load the response message
			$response = array('status' => "failed", 'message' => $_input_response['message']);
		}
		else
		{
			// Set the input into a variable
			$data = $_input_response['data'];
			$data['created_by'] = $validSession['token_data']['user_id'];
			// Set the plain password, for transmission via email
			$password_text = $data['password'];
			// Encrypt the password
			$data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
			// Set the company of the user
			$data['company_id'] = $validSession['token_data']['company_id'];
			// Create the user
			$this->generic->add($data, 'users');
			//Log the user action in the system audit
			$action = 'Created a new user account: ' . $data['username'];
			$auditLog = array('action_performed'=>$action, 'user_id'=>$validSession['token_data']['user_id']);
			$this->audit->add($auditLog, $this->agent);
			// Get the role details
			$_role = $this->userRole->find($data['user_role_id']);
			// Notify the user of the account creations
			$email_message = "An account has been created for you on Yara.io, the details of your account are as shown below";
			$email_message .= "<br /><strong>Username</strong>: $data[username]<br /><strong>Password</strong>: $password_text<br />";
			$email_message .= "<strong>Role</strong>: " . @$_role['user_role_name'] . "<br /><strong>Account Status</strong>: Activated";
			$email_message .= "<br /><strong>Login URL</strong>: " . base_url() . "/login/admin";
			$email_message = view('email_views/email', ['name'=>$data['lastname'], 'message'=>$email_message]);
			// send the email
			$this->notification->sendEmail($email_message, $data['email'], "New Account Created", "", NULL, true);
			// Load the success message
			$msg = 'User account has been created successfully';
			$response = array("status"=>"success", 'message'=>$msg);
		}
		// Return the output as a JSON object
		return $this->response->setJSON($response);
	}

	// Controller function to edit user
	public function edit()
	{
		// Validate user access/permissions
		$validSession = $this->auth_token->validateTokenAccess('USERS_EDIT', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}

		// Call model method to get the inputs from JSON
		$_input_response = $this->user->getFormInputEdit($this->request, $this->utility);
		// Check if input validation returned an error
		if ($_input_response['status'] == "failed"){
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
			// Load the response message
			$response = array('status' => "failed", 'message' => $_input_response['message']);
		}
		else
		{	
			// Set the ID of the user and also ensure this user can appropriately assess the user
			$id = $_input_response['id'];
			$_params = ['user_id'=>$id, 'company_id'=>$validSession['token_data']['company_id']];
			// Get the user details
			$_data = $this->user->getAll($_params, 0, 1);
			if(is_array($_data) && !empty($_data))
			{
				// Update the user
				$this->generic->edit($_input_response['data'], $id, 'users');
				// Log the user action in the system audit
				$action = 'Updated user record with ID: ' . $id;
				$auditLog = array('actionType'=>'Data Edit', 'action_performed'=>$action, 'userid'=>$validSession['token_data']['user_id']);
				$this->audit->add($auditLog, $this->agent);
				// Load the response message
				$msg = 'User account information has been updated.';
				$response = array("status"=>"success", 'message'=>$msg);
			}
			else
			{
				// Set the HTTP status code required
				$this->response->setStatusCode(400);
				// Prepare the right response message
				$response = array('status' => "failed", 'message' => 'Specified user could not be found');
			}
		}

		// Return the output as a JSON object
		return $this->response->setJSON($response);
	}

	function delete()
	{
		$validSession = $this->auth_token->validateTokenAccess('USERS_DELETE', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}

		// Get the id of the user
		$id = $this->request->getPost("id");
		//Ensure the user is not the currently logged in user
		if($id == $this->session->userid)
		{
			$msg = 'This is the current logged on user. Logged in user cannot be deleted.';
			$response = array("status"=>"failed", 'message'=>$msg);
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
		}
		else
		{
			// Set the deleted at field to the current date and time
			$this->generic->edit(['deleted_at'=>date("Y-m-d H:i:s"), "is_deleted"=>1], $id, 'users');
			// Log the user action in the system audit
			$action = 'User deleted user information record with ID: '.$id;
			$auditLog = array('actionType'=>'Data Deletion','action_performed'=>$action,'userid'=>$this->session->userid);
			$this->audit->add($auditLog, $this->agent);
			// Load index page with the success message
			$msg = 'User has been deleted successfully';
			$response = array("status"=>"success", 'message'=>$msg);
		}
		
		// Re-generate a new CSRF token for the next request
		$response['csrf_token'] = csrf_hash();
		// Return the output as a JSON object
		return $this->response->setJSON($response);
	}

	// Controller function to approve a newly created employee
    public function approve()
    {
		$validSession = $this->auth_token->validateTokenAccess('USERS_APPROVE', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}

        // Get the ids
		$ids = $this->request->getPost('record_ids');
        if(is_array($ids))
        {
            foreach($ids as $_id)
            {
                $_record = $this->generic->getByID($_id, 'users');
                if(is_array($_record)){
                    // Update the reading and set to approved
                    $this->generic->edit(['user_status'=>1], $_id, 'users');
                    // Log the user action in the system audit
                    $action = 'Approved user with record ID: ' . $_id;
                    $auditLog = array('actionType'=>'User Approval', 'action_performed'=>$action, 'user_id'=>$this->session->userid);
                    $this->audit->add($auditLog, $this->agent);
                }
            }
            //Load index page with the success message
			$msg = 'All selected users have been approved successfully';
			$response = array("status"=>"success", 'message'=>$msg);
        }
        else
		{
			$msg = 'There are no users selected for approval';
			$response = array("status"=>"error", 'message'=>$msg);
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
        }
		// Re-generate a new CSRF token for the next request
		$response['csrf_token'] = csrf_hash();
		// Return the output as a JSON object
		return $this->response->setJSON($response);
	}
	
	function deactivate()
	{
		$validSession = $this->auth_token->validateTokenAccess('USERS_DEACTIVATE', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}

		$id = $this->request->getPost('id');
		$userdata = $this->user->find($id);
		//Ensure the user is not the currently logged in user
		if(is_array($userdata) && $id != $this->session->userid)
		{
			$this->generic->edit(['user_status'=>0], $id, 'users');
			//Log the user action in the system audit
			$action = 'Deactivated user account with ID: ' . $id;
			$auditLog = array('action_type'=>'Account Deactivation','action_performed'=>$action, 'user_id'=>$this->session->userid);
			$this->audit->add($auditLog, $this->agent);
			// Prepare messgae
			$response = array('status'=>'success', 'message'=>'User account has been deactivated');
		}
		else{
			$response = array('status'=>'failed', 'message'=>'This is the current logged on user; You cannot deactivate a logged on account');
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
		}

		// Re-generate a new CSRF token for the next request
		$response['csrf_token'] = csrf_hash();
		// Return the output as a JSON object
		return $this->response->setJSON($response);
	}
	
	function activate()
	{
		// Ensure user has an active session and can access this module
		$validSession = $this->auth_token->validateTokenAccess('USERS_ACTIVATE', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}

		$id = $this->request->getPost('id');
		$userdata = $this->user->find($id);
		if($userdata != false)
		{
			$this->generic->edit(['user_status'=>1, 'force_password_change'=>1], $id, 'users');
			//Log the user action in the system audit
			$action = 'Activated user account with ID: ' . $id;
			$auditLog = ['action_type'=>'Data Activation','action_performed'=>$action, 'user_id'=>$this->session->userid];
			$this->audit->add($auditLog, $this->agent);
			// Notify the user of the account activation
			$email_message="Your account on the ITEX Dashboard has been activated successfully. <br /><strong>Username:</strong> $userdata[username]";
			$email_message .= "<br /><strong>Account Status:</strong> Active";
			$email_message = view('email_views/email', array('name'=>$userdata['firstname'], 'message'=>$email_message));
			$this->notification->sendEmail($email_message, $userdata['email'], "Your Account Has Been Activated!", "", NULL, true);
			// Prepare messgae
			$response = array('status'=>'success', 'message'=>'User account has been activated');
		}
		else{
			$response = array('status'=>'failed', 'message'=>'Your request is invalid');
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
		}

		// Re-generate a new CSRF token for the next request
		$response['csrf_token'] = csrf_hash();
		// Return the output as a JSON object
		return $this->response->setJSON($response);
	}
	
	// Controller function to reset user password
	public function resetpassword()
	{
		$validSession = $this->auth_token->validateTokenAccess('USERS_RESET_PASSWORD', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}

		// Get the user id whose password needs to be reset
		$user_id = $this->request->getPost("user_id");
		// Get the details of the user
		$userData = $this->user->find($user_id);
		if($userData != false)
		{
			//Edit password if necessary
			$changePwd = $this->request->getPost('password');
			$confirmPwd = $this->request->getPost('confirmpassword');
			if($changePwd != NULL && $changePwd != '' && strlen($changePwd) > 0)
			{
				if($changePwd == $confirmPwd)
				{
					$_data['password'] = password_hash($this->request->getPost('password'), PASSWORD_BCRYPT);
					// Force the user to reset upon next login
					$_data['force_password_change'] = 1;
					// Perform the edit
					$this->generic->edit($_data, $user_id, "users");
					//Log the user action in the system audit
					$action = 'User reset password information record for User ID: ' . $user_id . " was initiated.";
					$auditLog = array('action_type'=>'Password Reset','action_performed'=>$action, 'user_id'=>$this->session->userid);
					$this->audit->add($auditLog, $this->agent);
					// Notify the user of the account creations
					$email_message = "Your password on the ITEX Dashboard, has been reset by the administrator";
					$email_message .= "<br /><strong>New Password</strong>: $changePwd<br />You can now login to your account using your new password.";
					$email_message .= "Upon login you will be required to set a new password.";
					$email_message = view('email_views/email', array('name'=>$userData['firstname'], 'message'=>$email_message));
					// send the email
					$this->notification->sendEmail($email_message, $userData['email'], "Password Reset Notification", "", NULL, true);
					// Prepare messgae
					$response = array("status"=>"success", 'message'=>'User password has been reset successfully');
				}
				else 
				{
					//Prepare message
					$response = array("status"=>"failed", 'message'=>'New password and confirm password do not match.');
					// Set the HTTP status code required
					$this->response->setStatusCode(400);
				}
			}
			else
			{
				// Prepare message
				$response = array("status"=>"failed", 'message'=>'Your password reset inputs were empty.');
				// Set the HTTP status code required
				$this->response->setStatusCode(400);
			}
		}
		else
		{
			// Prepare messgae
			$response = array("status"=>"failed", 'message'=>'User account does not exist');
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
		}

		// Re-generate a new CSRF token for the next request
		$response['csrf_token'] = csrf_hash();
		// Return the output as a JSON object
		return $this->response->setJSON($response);
	}

	// Controller function to find a user/employee for select 2
	public function find()
	{
		$this->sessionValidate->validatePublic($this->request);
		$filterparams['search'] = $this->request->getGetPost('term');
		$_response = array();
		$records = $this->user->findUser($filterparams);
		if(is_array($records)){
			foreach($records as $_data){
				$_response[] = array(
					'id'=>$_data['id'],
					'text'=> $_data['lastname'] . ' ' . $_data['firstname'] . ' (' . $_data['username'] . ') - ' . $_data['id']
				);
			}
		}
		$data = array("results" => $_response);
		// Return the output as a JSON object
		return $this->response->setJSON($data);
	}
}