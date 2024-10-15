<?php namespace App\Controllers;

use CodeIgniter\Controller;

use App\Models\Auth_clientModel;
use App\Models\Auth_tokenModel;
use App\Models\GenericModel;
use App\Models\LoginModel;
use App\Models\NotificationModel;
use App\Models\Role_assignmentModel;
use App\Models\SystemAuditModel;
use App\Models\System_moduleModel;
use App\Models\UserModel;
use App\Models\User_roleModel;
use App\Models\UtilityModel;
use App\Models\ValidateSessionModel;

class User_roles extends BaseController
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
		$this->system_module = new System_moduleModel();
		$this->user = new UserModel();
		$this->user_role = new User_roleModel();
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
		$this->filterparams['user_role_id'] = $this->request->getGetPost('user_role_id');
		$this->filterparams['status'] = $this->request->getGetPost('status');
		$this->filterparams['search'] = $this->request->getGet('search[value]');
		$this->filterparams['term'] = $this->request->getGetPost('term');
	}

	// Controller function to get data of a selected user
	public function get($id = 0)
	{
		// Validate the user's session before proceeding
		$validSession = $this->auth_token->validateTokenAccess('USER_ROLES_INDEX', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}
		// Process any required filters
		$this->filterparams = $this->auth_token->addTokenFilter($this->filterparams, $validSession['token_data']);
		// Get method to fetch the data
		$this->filterparams['user_role_id'] = $id;
		// Fetch any limits or offset from the db
		$offset = ($this->request->getGet('offset') == '') ? 0 : $this->request->getGetPost('offset');
        $limit = ($this->request->getGet('limit') == '') ? 10 : $this->request->getGetPost('limit');
		// Call method to fetch the list of accounts
		$records = $this->user_role->getAll($this->filterparams, $offset, $limit);
		// If id value is set, meaning it is a single role, get all the permissions for the role
		if($id > 0){
			$condition_array = array("role_id"=>$id, "permitted"=>1);
			$app_modules = $this->generic->findByCondition($condition_array, "role_assignments");
		}
		// Get total available records
		$records_count = $this->user_role->getAllCount($this->filterparams);
		// Prepare the response array
		$_data = ['status'=>'success', 'draw' => 0, 'recordsFiltered' => $records_count, 'recordsTotal' => $records_count, 'data' => $records, 'app_modules'=>$app_modules, ];
		// Return the response
		return $this->response->setJSON($_data);
	}

	// Controller function to create a new role
	public function create()
	{
		$validSession = $this->sessionValidate->validateAccess("USER_ROLES_CREATE", $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}

		// Get the edit inputs
		$_input_response = $this->user_role->getFormInput($this->request, $this->utility);
		// Perform a selection of success or failed
		if ($_input_response['status'] == "failed")
		{
			// Load the response message
			$response = array('status' => "failed", 'message' => $_input_response['message']);
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
		}
		else
		{
			// Set the input into a variable
			$data = $_input_response['data'];
			$data['created_by'] = $validSession['token_data']['user_id'];
			//Enter the user role information
			$role_id = $this->generic->add($data, "user_roles");
			// All the available app modules on the platform
			$appModules = $this->system_module->getAll($validSession['token_data']['company_id']);
			// Call method to create the permissions for the role
			$this->user_role->createPermissionInputs($this->request, $this->generic, $role_id, $_input_response['selected_modules'], $appModules);
			// Log the user action in the system audit
			$action = 'User created new role: '.$data['user_role_name'];
			$auditLog = ['action_performed'=>$action, 'action_type'=>'Data Creation', 'user_id'=>$validSession['token_data']['user_id']];
			$this->audit->add($auditLog, $this->agent);
			// Load the success message
			$msg = 'User role has been created successfully';
			$response = array("status"=>"success", 'message'=>$msg);
		}
		// Return the output as a JSON object
		return $this->response->setJSON($response);
	}

	// Controller function to create a new role
	public function edit()
	{
		$validSession = $this->sessionValidate->validateAccess("USER_ROLES_EDIT", $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}
		// Get the edit inputs
		$_input_response = $this->user_role->getFormInputEdit($this->request, $this->utility);
		// Perform a selection of success or failed
		if ($_input_response['status'] == "failed")
		{
			// Load the response message
			$response = array('status' => "failed", 'message' => $_input_response['message']);
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
		}
		else
		{
			// Set the input into a variable
			$data = $_input_response['data'];
			// Get the role id
			$id = $_input_response['id'];
			//Enter the user role information
			 $this->generic->edit($data, $id, "user_roles");
			 // Call method to create the permissions for the role
			$this->user_role->createPermissionInputs($this->request, $this->generic, $id, $_input_response['selected_modules'], $appModules);
			// Log the user action in the system audit
			$action = 'User updated role: ' . $data['user_role_name']. ' with ID: ' . $id;
			$auditLog = array('action_performed'=>$action, 'action_type'=>'Data Edit', 'user_id'=>$validSession['token_data']['user_id']);
			$this->audit->add($auditLog, $this->agent);

			// Load the success message
			$msg = 'User role has been updated.';
			$response = array("status"=>"success", 'message'=>$msg);
		}
		// Re-generate a new CSRF token for the next request
		$response['csrf_token'] = csrf_hash();
		// Return the output as a JSON object
		return $this->response->setJSON($response);
	}

	// Controller end-point to de-activate a role
	function deactivate($id=NULL)
	{
		$validSession = $this->sessionValidate->validateAccess('USER_ROLES_DEACTIVATE', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}
		
		$_role_data = $this->user_role->find($id);
		//Ensure the user is not the currently logged in user
		if(is_array($_role_data) && !empty($_role_data) && $_role_data['company_id'] == $validSession['token_data']['company_id'])
		{
			$this->generic->edit(['status'=>0], $id, 'user_roles');
			//Log the user action in the system audit
			$action = 'Deactivated user role with ID: ' . $id;
			$auditLog = ['action_type'=>'Role Deactivation','action_performed'=>$action, 'user_id'=>$validSession['token_data']['user_id']];
			$this->audit->add($auditLog, $this->agent);
			// Prepare messgae
			$response = ['status'=>'success', 'message'=>'User role has been deactivated'];
		}
		else{
			$response = ['status'=>'failed', 'message'=>'Your action specified is invalid'];
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
		}

		// Re-generate a new CSRF token for the next request
		$response['csrf_token'] = csrf_hash();
		// Return the output as a JSON object
		return $this->response->setJSON($response);
	}
	
	// Controller end-point to activate a role
	function activate()
	{
		// Ensure user has an active session and can access this module
		$validSession = $this->sessionValidate->validateAccess('USER_ROLES_ACTIVATE', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}

		$id = $this->request->getPost('id');
		$_role_data = $this->user_role->find($id);
		if($_role_data != false)
		{
			$this->generic->edit(['status'=>1], $id, 'user_roles');
			//Log the user action in the system audit
			$action = 'Activated user role with ID: ' . $id;
			$auditLog = ['action_type'=>'Role Activation','action_performed'=>$action, 'user_id'=>$validSession['token_data']['user_id']];
			$this->audit->add($auditLog, $this->agent);
			// Prepare messgae
			$response = array('status'=>'success', 'message'=>'User role has been activated');
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

	// Controller function to delete a role
	public function delete()
	{
		$validSession = $this->sessionValidate->validateAccess('USER_ROLES_DELETE', $this->request);
		if($validSession['status'] == false){
			return redirect()->to($this->failedSessionRedirect($this->request, $validSession['message']));
		}
		
		$role_id = $this->request->getPost('id');
		//Ensure the role is not the superadmin role
		if($role_id == 4000001)
		{
			$msg = 'The super administrator role cannot be deleted from the system.';
			$response = ["status"=>"error", 'message'=>$msg];
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
			// Re-generate a new CSRF token for the next request
			$response['csrf_token'] = csrf_hash();
			// Return the output as a JSON object
			return $this->response->setJSON($response);
		}
		// Check if there are user_roles assigned to this role before allowing deletion
		$_users = $this->generic->getByFieldSingle('user_role_id', $role_id, 'users');
		if(!is_array($_users) || empty($_users))
		{
			// Mark the role as deleted
			$this->generic->edit(['deleted_at'=>date('Y-m-d H:i:s'), 'is_deleted'=>1], $role_id, 'user_roles');
			// Set the conditions for the role assignment removal
			$_cond = ['role_id'=>$role_id];
			// Remove all the permissions
			$this->generic->editByConditions(['deleted_at'=>date('Y-m-d H:i:s'), 'is_deleted'=>1], $_cond, 'role_assignments');
			// Log the user action in the system audit
			$action = 'User deleted user role information record with ID: ' . $role_id;
			$auditLog = ['action_type'=>'Data Deletion','action_performed'=>$action, 'user_id'=>$validSession['token_data']['user_id']];
			$this->audit->add($auditLog, $this->agent);
			//Load index page with the success message
			$msg = 'User role has been deleted successfully';
			$response = array("status"=>"success", 'message'=>$msg);
		}
		else
		{
			$msg = 'This data cannot be deleted because there are other users attached to this role';
			$response = array("status"=>"error", 'message'=>$msg);
			// Set the HTTP status code required
			$this->response->setStatusCode(400);
		}

		// Re-generate a new CSRF token for the next request
		$response['csrf_token'] = csrf_hash();
		// Return the output as a JSON object
		return $this->response->setJSON($response);
	}
}