<?php namespace App\Models;

use CodeIgniter\Model;

class User_roleModel extends Model
{
	protected $table      = 'user_roles';
    protected $primaryKey = 'id';

    protected $returnType     = 'array';
    protected $useSoftDeletes = true;

	protected $allowedFields = ['user_role_name', 'role_description', 'status', 'role_type', 'role_home', 'is_deleted'];
	
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
	protected $deletedField  = 'deleted_at';
	
	// Model funtion to perform various filter actions
	function queryParameters($builder, $query_params=[])
	{
	    $params = array();
	    
	    // sanitize params and only pass along the ones with data
	    foreach ($query_params as $key => $value)
	    {
	        if ($value != '' && $value != NULL && $value != 'all' && $value != -1)
	        {
	            $params[$key] = $value;
	        }
	    }
		
		// filter by user id
	    if(isset($params['user_role_id']))
	    {
	        $builder->where(['user_roles.id'=>$params['user_role_id']]);
		}

		// filter by user role name
	    if(isset($params['user_role_name']))
	    {
	        $builder->where(['user_roles.user_role_name'=>$params['user_role_name']]);
		}
	    
	    // filter by company id
	    if(isset($params['company_id']))
	    {
	        $builder->where(['user_roles.company_id'=>$params['company_id']]);
		}

	    // filter by username
	    if(isset($params['status']))
	    {
	        $builder->where(array('user_roles.status'=>$params['status']));
	    }
	    
	    // if it is a search
	    if(isset($params['search']))
	    {
			$params['search'] = esc($params['search']);
	        $builder->where("(user_roles.userrolename LIKE'%$params[search]%' ESCAPE '!')");
	    }
	    
	    // Ensure only records that have not been deleted are filtered
	    $builder->where(array('user_roles.is_deleted'=>0));
	}

	// Get all the available users in the database
	function getAll($param=[], $offset=0, $limit=10)
	{
		$builder = $this->db->table('user_roles');
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		// Add the limits
		$builder->limit($limit, $offset);
		// Add ordering to it
		$builder->orderBy('user_roles.user_role_name', 'asc');
		$query = $builder->get();
		return $query->getResultArray();
	}

	// Get count of all the available users in the database
	function getAllCount($param=[])
	{
		$builder = $this->db->table('user_roles');
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		return $builder->countAllResults();
	}

	// Get all the active roles in the database
	function getActive($param=[])
	{
		$builder = $this->db->table('user_roles');
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		// Add the additional where clauses
		$builder->where(['user_roles.status'=>1, 'user_roles.is_deleted'=>0]);
		$query = $builder->get();
		return $query->getResultArray();
	}

	// Get a role information by the role name
	/*function getByName($roleName)
	{
		$builder = $this->db->table('system_modules');
		$builder->where(['user_rolename'=>$roleName, 'user_roles.is_deleted'=>0]);
		$this->queryParameters($builder, $param);
		$query = $builder->get();
		return $query->getRowArray();
	}*/

	// Method to get all the role permissions from the JSON input for creation
	function createPermissionInputs($request, $generic, $role_id, $selected_modules, $appModules)
	{
		// first create all the role records
		if(is_array($appModules) && !empty($appModules)){
			foreach($appModules as $_module){
				$generic->add(['module_id'=>$_module['id'], 'role_id'=>$role_id, 'permitted'=>0], 'role_assignments');
			}
		}
		// Now assign the modules that have come with the inputs
		if(is_array($selected_modules)){
			foreach($selected_modules as $_module_id){
				$_cond = array('module_id'=>$_module_id, 'role_id'=>$role_id);
				$generic->editByConditions(['permitted'=>1], $_cond, 'role_assignments');
			}
		}
	}

	// Method to get all the role permissions from the JSON input for the edit process
	function createEditPermissionInputs($request, $generic, $role_id, $selected_modules, $appModules)
	{
		$generic->editByConditions(['permitted'=>0], ['role_id'=>$role_id], 'role_assignments');
		if(is_array($selected_modules)){
			foreach($selected_modules as $_module_id){
				$_cond = ['module_id'=>$_module_id, 'role_id'=>$role_id];
				// Check that the module already exists on the user's profile
				$_data = $generic->findByCondition($_cond, 'role_assignments');
				if(is_array($_data) && !empty($_data)){
					$generic->editByConditions(['module_id'=>$_module_id, 'permitted'=>1], $_cond, 'role_assignments');
				}
				else
					$generic->add(['module_id'=>$_module_id, 'role_id'=>$role_id, 'permitted'=>1], 'role_assignments');
			}
		}
	}

	// Method to get form input and perform validations required
	function getFormInput($request, $utility)
	{
		// Get the JSON data from the request
		$json_data = $request->getJSON(true);
		// Now pass the data into a new array
		$_data = [
			'user_role_name'	=> @$json_data['user_role_name'],
			'role_description' 	=> @$json_data['role_description'],
			'status'			=> @$json_data['status'],
			'role_type'			=> @$json_data['role_type']
		];
		// Load the form validation service
		$validation =  \Config\Services::validation();
		// Perform the form validations required
		if ($validation->run($_data, 'new_user_role') == FALSE){
			$message = $utility->processValidationErrorMessages($validation->getErrors());
			$response = array("status"=>"failed", 'message'=>$message);
		}
		else{
			$response = array("status"=>"success", 'data'=>$_data, 'selected_modules'=>@$json_data['app_modules']);
		}
		// Return the response
		return $response;
	}

	// Method to get form input and perform validations required
	function getFormInputEdit($request, $utility)
	{
		// Get the JSON data from the request
		$json_data = $request->getJSON(true);
		// Now pass the data into a new array
		$_data = [
			'user_role_name'	=> @$json_data['user_role_name'],
			'role_description' 	=> @$json_data['role_description'],
			'status'			=> @$json_data['status'],
			'role_type'			=> @$json_data['role_type']
		];
		// Load the form validation service
		$validation =  \Config\Services::validation();
		// Perform the form validations required
		if ($validation->run($_data, 'edit_user_role') == FALSE){
			$message = $utility->processValidationErrorMessages($validation->getErrors());
			$response = array("status"=>"failed", 'message'=>$message);
		}
		else{
			$response = array("status"=>"success", 'data'=>$_data, 'selected_modules'=>@$json_data['app_modules'], 'id'=>@$json_data['id']);
		}
		// Return the response
		return $response;
	}
}