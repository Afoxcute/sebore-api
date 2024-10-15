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

class States extends BaseController
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

	// Controller function to list all admin states on the platform
	public function index()
	{
		$this->valSessObj->validate(__METHOD__);
		
		$data['breadCrumbs'] = '<li class="breadcrumb-item active" aria-current="page">Local Government Areas</li>';
		$data['pageheader'] = "State Management";
		$data['mainmenu'] = "setup";
		$data['submenu'] = "states";

		// Define what actions state can perform on the records
		$data['can_edit'] = $this->valSessObj->hasPermission('States::edit');
		$data['can_delete'] = $this->valSessObj->hasPermission('States::delete');
		// Set the new call hander for a new state form pop-up
		$data['create_modal'] = "#new-state-modal";
		$data['create_title'] = "Create state";
		// Set the new call hander for a new position upload form pop-up
		$data['upload_modal'] = "#upload-state-modal";
        $data['upload_title'] = "Upload States";
        // Load all states in the DB
        $data['states'] = $this->state->loadAll();
		// Specify the content file and load the view
		$data['content_file'] = 'states';
		return view('layout', $data);
	}

	// Controller function to get states list and reply with JSON
	public function get_all()
	{
        $this->valSessObj->validatePublic();
        
	    $offset = intval($this->request->getGetPost('start'));
        $length = intval($this->request->getGetPost('length'));
        // Get any available filter options
        $filterparams['search'] = $this->request->getGetPost('search[value]');
        $filterparams['region_id'] = $this->request->getGetPost('region_id');
	    
	    if($length == 0){
	        $length = 10;
	    }
	    
	    // Set default color
	    $records = $this->state->getAll($filterparams, $offset, $length);
	    $records_count = $this->state->getAllCount($filterparams);
	    $data = array(
	        "draw" => 0,
	        "recordsFiltered" => $records_count,
	        "recordsTotal" => $records_count,
	        "data" => $records
	    );
	    
		// Return the output as a JSON object
		return $this->response->setJSON($data);
	}

	// Controller function to get data of a selected state
	public function get($id = 0)
	{
	    $this->valSessObj->validate("States::index");
		// Find the state specified
	    $records = $this->generic->getByID($id, "states");
		if(is_array($records) && count($records)>0)
			$data = array("status"=>"success", "data" => $records);
		else
			$data = array("status"=>"failed", "message" => "Selected state data was not found!");
	    
		// Return the output as a JSON object
		return $this->response->setJSON($data);
	}
}