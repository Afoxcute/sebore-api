<?php namespace App\Controllers;

use CodeIgniter\Controller;

use App\Models\GenericModel;
use App\Models\LoginModel;
use App\Models\SystemAuditModel;
use App\Models\UserModel;
use App\Models\UtilityModel;
use App\Models\ValidateSessionModel;

class Auth extends BaseController
{
	function __construct()
	{
		// Create objects of the required models
		$this->generic = new GenericModel();
		$this->login = new LoginModel();
		$this->audit = new SystemAuditModel();
		$this->user = new UserModel();
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
	}
	
	function index()
	{
        return $this->response->setJSON(['status'=>'failed', 'message'=>'Authentication is required']);
    }
    
	// Controller method to generate a new CSRF token during an ajax request. for access denied response
	public function access_denied()
	{
		$msg = 'You do not have access to the specified resource';
		$data = array('status'=>"failed", 'message'=>$msg, 'system'=>'access denied');
		// Set the HTTP status code required
		$this->response->setStatusCode(403);
		// Return the output as a JSON object
		return $this->response->setJSON($data);
	}

	// Controller method to generate a new CSRF token during an ajax request. for expired session response
	public function expired_session()
	{
		$msg = 'You no longer have an active session. You will be redirected to login';
		$data = array('status'=>"failed", 'message'=>$msg, 'system'=>'session expired');
		// Re-generate a new CSRF token for the next request
		$data['csrf_token'] = csrf_hash();
		// Set the HTTP status code required
		$this->response->setStatusCode(401);
		// Return the output as a JSON object
		return $this->response->setJSON($data);
	}
}