<?php namespace App\Controllers;

use CodeIgniter\Controller;

use App\Models\CompanyModel;
use App\Models\GenericModel;
use App\Models\LoginModel;
use App\Models\NotificationModel;
use App\Models\Role_assignmentModel;
use App\Models\SystemAuditModel;
use App\Models\UserModel;
use App\Models\User_roleModel;
use App\Models\UtilityModel;
use App\Models\ValidateSessionModel;

// Load the Google authentication library namespace
use App\Libraries\GoogleAuthenticator;

class Login extends BaseController
{
	function __construct()
	{
		// Create objects of the required models
		$this->company = new CompanyModel();
		$this->generic = new GenericModel();
		$this->login = new LoginModel();
		$this->notification = new NotificationModel();
		$this->role_assignment = new Role_assignmentModel();
		$this->audit = new SystemAuditModel();
		$this->user = new UserModel();
		$this->user_role = new User_roleModel();
		$this->utility = new UtilityModel();
		$this->sessionValidate = new ValidateSessionModel();
		// some Generic message
		$this->action_not_allowed = 'This action is not allowed';
		// Set the HTTP Request object
		$this->request = \Config\Services::request();
		// Set the HTTP Response object
		$this->response = \Config\Services::response();
		// To set the output content types when the request is an ajax request
		// if($this->request->isAJAX())
		// {
			$this->response->setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
			$this->response->setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
			$this->response->setHeader('Content-type', 'application/json');
			$this->response->setHeader('Access-Control-Allow-Origin', '*');
			$this->response->setHeader('Cache-Control', 'no-cache, must-revalidate');
		// }
		// Set the X-Frame-Options header
		$this->response->setHeader('X-Frame-Options', 'SAMEORIGINX');
		// Get the user agent and make it available globally
		$this->agent = $this->request->getUserAgent();

		// set access control headers to mitigate cors
		header("Access-Control-Allow-Origin: *");
		header("Access-Control-Allow-Headers: *");
	}

	// Load the main login page of the app
	public function index($status='')
	{
		// Return the output as a JSON object
		return $this->response->setJSON(["status"=>"success", 'message'=>'Login end-points']);
	}

	// Controller method to authenticate the user
	public function authenticate()
	{
		// Call method to fetch credentials from the user
		$_inputs = $this->login->getFormInput($this->request, $this->utility);
		if ($_inputs['status'] == 'failed'){
			// Return the entire input as response
			return $this->response->setJSON($_inputs);
		}
		//call method to check users' authentication data
		$_login = $this->login->checkLogin($_inputs['data']['username'], $_inputs['data']['password']);
		if($_login['status'] == 'success'){
			// Update the user's data, including last login and IP
			$this->user->save(['login_attempts'=>0, 'id'=>$_login['data']['id']]);
			// Generate and store user's auth token
			$token = password_hash($this->utility->generateCode(), PASSWORD_BCRYPT);
			$_auth_data = ['token'=>$token,'user_id'=>$_login['data']['id'],'company_id'=>$_login['data']['company_id'],'account_id'=>$_login['data']['account_id'], 'expires_on'=>strtotime('+30 min')];
			$this->generic->add($_auth_data, 'auth_tokens');
			// Log the user action in the system audit, first get the user agent details from the request
			$action = 'User logged in successfully';
			$auditLog = ['action_performed'=>$action, 'action_type'=>"Login", 'user_id'=>$_login['data']['id']];
			$this->audit->add($auditLog, $this->agent);
			// Get the user details
			$_user = $this->user->getUserAccountId($_auth_data['user_id']);
			// Fetch allowed modules of the user
			$_user['role_access'] = $this->role_assignment->roleAssignmentDetails($_user['user_role_id']);
			// Fetch the company info
			$_user['company_info']= $this->company->getDetails($_auth_data['company_id']);
			// Merge the data
			$_auth_data = array_merge($_auth_data, $_user);
			// Prepare the response message
			$response = ["status"=>"success", 'data'=>$_auth_data, 'message'=>'Your login attempt was successful'];
		}
		else{
			// failed login attempt
			if(@$_login['data']['user_status'] == 0){
				$message = "Your account has been deactivated.";
			}
			else if(@$_login['data']['login_attempts'] >= 2)
			{
				// Reset the login attempt to zero and lock the account
				$this->user->save(['login_attempts'=>0, 'user_status'=>0, 'force_password_change'=>1, 'id'=>$_login['data']['id']]);
				$message = "Invalid username/password. Your account has now been de-activated after too many failed logins. Contact the administrator.";
			}
			else
			{
				// Increase the login attempt to zero and lock the account
				$this->user->save(['login_attempts'=>$_login['data']['login_attempts'] + 1, 'id'=>$_login['data']['id']]);
				// Set the error message
				$message = 'Username/password supplied is invalid. Please enter correct details and try again';
			}
			$response = ["status"=>"failed", 'message'=>$message];
			// Set the HTTP status code required
			$this->response->setStatusCode(401);
		}
		// Return the output as a JSON object
		return $this->response->setJSON($response);
	}

	// Controller method to display password reset
	public function forgot_password()
	{
		// Get the username
		$username = $this->request->getPost('username');
		// fetch the user's details
		$_user = $this->generic->getByFieldSingle('username', $username, 'users');
		if(is_array($_user) && !empty($_user)){
			// Generate a code
			$code = rand(100001,999999);
			// Create a password reset record
			$id = $this->generic->add(['user_id'=>$_user['id'], 'token'=>$code, 'expires_on'=>strtotime('+30 min')], 'password_resets');
			// Send the generated token to the user's email address
			$email_message = "A password reset request has been created on your account on Yara.io<br />";
			$email_message .= "Please click <strong><a href='" . site_url('login/confirm_recovery/' . $id . '/' . $code) . "'>here</a>";
			$email_message .= "</strong> to complete the action <br /><p>This link expires in 30 minutes. <br />If you did not initiate this";
			$email_message .= " request please ignore this email</p>";
			$email_message = view('email_views/email', ['name'=>$_user['lastname'], 'message'=>$email_message]);
			// send the email
			$this->notification->sendEmail($email_message, $_user['email'], "Password Reset Request");
			// Load the error into the default handler
			$message = "A password reset email has been sent to the attached email address of this account.";
			$response = ["status"=>"success", 'message'=>$message];
		}
		else{
			// Load the error into the default handler
			$response = ["status"=>"failed", 'message'=>"That account does not exist"];
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
		}
		// Return the output as a JSON object
		return $this->response->setJSON($response);
	}

	// Controller method to confirm the password recovery codes
	public function confirm_recovery($id, $code)
	{
		// Fetch the password reset details
		$_password_reset = $this->generic->getByID($id, 'password_resets');
		if(is_array($_password_reset) && !empty($_password_reset))
		{
			// Ensure it has not expired
			if ($_password_reset['expires_on'] > strtotime('now'))
			{
				// Fetch the user's details
				$_user = $this->generic->getByID($_password_reset['user_id'], 'users');
				// Generate a new password
				$new_password = $this->utility->generateCode();
				// Send the generated password to the user's email address
				$email_message = "Your password reset on the Yara.io was successful, below is your new password. ";
				$email_message .= "Temporary Password: <strong>$new_password</strong><p>You will be required to set a new password at your";
				$email_message .= "next login</p>";
				$email_message = view('email_views/email', array('name'=>$_user['firstname'], 'message'=>$email_message), TRUE);
				// send the email
				$this->notification->sendEmail($email_message, $_user['email'], "Password Reset Successful");
				// Update the password now
				$this->generic->edit(['password'=>password_hash($new_password, PASSWORD_BCRYPT)], $_user['user_id'], 'users');
				// Load the error into the default handler
				$message = "A new password has been sent to your account email address.";
				// Return the output as a JSON object
				return $this->response->setJSON(["status"=>"success", 'message'=>$message]);
			}
			else
			{
				// Set the HTTP status code required
				$this->response->setStatusCode(400);
				// Return the output as a JSON object
				return $this->response->setJSON(["status"=>"success", 'message'=>'This action is not allowed']);
			}
		}
	}
}