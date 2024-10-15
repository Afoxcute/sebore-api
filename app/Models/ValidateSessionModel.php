<?php namespace App\Models;

use CodeIgniter\Model;
// import the user model into this class
use App\Models\Auth_tokenModel;
use App\Models\Role_assignmentModel;
use App\Models\UserModel;
use App\Models\UtilityModel;


class ValidateSessionModel extends Model
{
	// The class constructor
	function __construct()
	{
		// Create an object of the user model
		$this->auth_token = new Auth_tokenModel();
		$this->roleAssign = new Role_assignmentModel();
		$this->user = new UserModel();
		$this->utility = new UtilityModel();
	}

	// Method to validate a user's permission for a specified module
	public function validateAccess($module, $request)
	{
		$session = session();
		// Check if the bearer token is set
		if($request->hasHeader('Authorization') == true)
		{
			// Get the authorization header
			$authorization = explode(' ', $request->getHeader('Authorization'));
			// Fetch the token, from the array data
			$token = @$authorization[1];
			if($token != null && $token != ''){
				// Call method to validate the token
				return $this->auth_token->validateTokenAccess($module, $token);
				//return ['status'=>false, 'message'=>'force_password'];
			}
			$_user = $this->user->find($session->userid);
			if((is_array($_user) && !empty($_user)) || $session->access_type == 2){
				//ensure user has the needed permition to access the method
				$permitted = $this->roleAssign->roleAccess($session->user_role_id, $controllerName, $session->access_type);
				if($permitted == true){
					return ['status'=>true, 'message'=>'valid'];
				}
				else{
					return ['status'=>false, 'message'=>'accessdenied'];
				}
			}
		}
		return ['status'=>false, 'message'=>'expired'];
	}

	// Method to confirm user has a valid session
	function validatePublic($request)
	{
		$session = session();
		if($session->force_password_change == 1)
		{
			return ['status'=>false, 'message'=>'force_password'];
		}
		if($session->loggedIn == true)
		{
			$_user = $this->user->find($session->userid);
			if((is_array($_user) && !empty($_user)) || $session->access_type == 2){
				return ['status'=>true, 'message'=>'valid'];
			}
		}
		return ['status'=>false, 'message'=>'expired'];
	}

	// Method to confirm a merchant user's session
	function validateMerchant($request)
	{
		$session = session();
		if($session->force_password_change == 1)
		{
			return ['status'=>false, 'message'=>'force_password'];
		}
		if($session->loggedIn == true)
		{
			if($session->access_type == 2){
				return ['status'=>true, 'message'=>'valid'];
			}
			else{
				return ['status'=>false, 'message'=>'accessdenied'];
			}
		}
		return ['status'=>false, 'message'=>'expired'];
	}
	
	// Method to check if user has permission to a given module
	function hasPermission($controllerName)
	{
		$session = session();
		if($session->loggedIn == true){
			return $this->roleAssign->roleAccess($session->user_role_id, $controllerName, $session->access_type);
		}
		else
			return false;
	}

	// Method to obtain master token
	public function obtainCoreToken()
	{
		$session = session();
		if($session->loggedIn == true && $session->adminLogin == true)
		{
			$loginData = ['email'=>'admin@mail.com', 'password'=>'admin'];
			// Call the API to authenticate the merchant
			$post_data = ['user'=>[$loginData]];
			$api_url = CORE_BASE_URL . 'merchant/account/authenticate';
			$_response = $this->utility->makePostJSONCall($api_url, $post_data);
			if($_response['http_code'] == 200){
				// Save the obtained token into the session
				$session->set('access_token', $_response['data']['access_token']);
			}
		}
	}
}