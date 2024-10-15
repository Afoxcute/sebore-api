<?php namespace App\Controllers;

use CodeIgniter\Controller;

use App\Models\GenericModel;
use App\Models\LoginModel;
use App\Models\NotificationModel;
use App\Models\Role_assignmentModel;
use App\Models\SystemAuditModel;
use App\Models\UserModel;
use App\Models\User_roleModel;
use App\Models\UtilityModel;
use App\Models\ValidateSessionModel;

class User_audits extends BaseController
{
	function __construct()
	{
		// Create objects of the required models
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
	}

	// Controller function to list all admin users on the platform
	public function index($userid)
	{
		$this->sessionValidate->validateAccess(__METHOD__);
		
		$user = $this->generic->getByID($userid, "users");
		$data['userid'] = $user['id'];
		$data['breadCrumbs'] = '<li class="breadcrumb-item active"><a href="'.site_url("users").'">Users</a></li><li class="breadcrumb-item active">User Audit ('.$user['firstname'].')</li>';
		$data['pageheader'] = "User Audit Log";
		$data['mainmenu'] = "security";
		$data['submenu'] = "users";
		// Specify the content file and load the view
		$data['content_file'] = 'user_audits';
		return view('layout', $data);
	}

	// Controller function to get users list and reply with JSON
	public function getaudits($userid=NULL)
	{
	    $this->sessionValidate->validateAccess("Users::index");
	    
	    $offset = intval($this->request->getGetPost('start'));
	    $length = intval($this->request->getGetPost('length'));
	    $filterparams['search'] = $this->request->getGetPost('search[value]');
	    
	    $filterparams['userid'] = $userid;
	    if($userid == NULL)
	    	$filterparams['userid'] = $this->request->getGetPost("userid");
	    
	    if($length == 0){
	        $length = 10;
	    }
	    
	    // Set default color
	    $records = $this->audit->getAll($filterparams, $offset, $length);
	    $records_count = $this->audit->getAllCount($filterparams);
	    $data = array(
	        "draw" => 0,
	        "recordsFiltered" => $records_count,
	        "recordsTotal" => $records_count,
	        "data" => $records
	    );
	    
		// Return the output as a JSON object
		return $this->response->setJSON($data);
	}
}
?>