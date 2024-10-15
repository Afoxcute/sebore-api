<?php namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
	protected $table      = 'users';
    protected $primaryKey = 'id';

    protected $returnType     = 'array';
    protected $useSoftDeletes = true;

	protected $allowedFields = ['othernames', 'lastname', 'email', 'phone_number', 'username', 'password', 'user_status', 'access_type', 'force_password_change', 'last_login', 'last_login_ip', 'login_attempts', 'otp_attempts', 'ga_secret', '2fa_setup', 'pending_edit', 'user_image_path','created_by','approved_by','approved_on', 'is_deleted'];
	
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
	protected $deletedField  = 'deleted_at';
	
	protected $validationRules    = [
		'othernames'    => 'required',
		'lastname'     => 'required',
		'phone_number' => 'required',
		'username'     => 'required|alpha_numeric_space|min_length[6]|is_unique[users.username]',
        'email'        => 'required|valid_email|is_unique[users.email]',
        'password'     => 'required|min_length[8]|max_length[20]',
        'repassword'   => 'required_with[password]|matches[password]'
    ];
	
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
	    if(isset($params['user_id']))
	    {
	        $builder->where(['users.id'=>$params['user_id']]);
		}
	    
	    // filter by company id
	    if(isset($params['company_id']))
	    {
	        $builder->where(['users.company_id'=>$params['company_id']]);
		}
		
	    // Filter user by status; active or inactive
	    if(isset($params['user_status']))
	    {
			if(strtolower($params['user_status']) == 'active')
				$builder->where(['users.user_status' => 1]);
			else if(strtolower($params['user_status']) == 'pending')
				$builder->where(['users.user_status' => -1]);
			else if(strtolower($params['user_status']) == 'inactive')
				$builder->where(['users.user_status' => 0]);
	    }
	    
	    if(isset($params['created_at']) && !empty($params['created_at']))
	    {
	        $t_date = explode("-", $params['created_at']);
	        $startdate = date("Y-m-d", strtotime($t_date[0]));
	        $enddate = date("Y-m-d", strtotime($t_date[1]));
	        $builder->where(['users.created_at >='=>$startdate, 'users.created_at <='=>$enddate. ' 23:59:59']);
	    }
	    
	    // if it is a search
	    if(isset($params['search']))
	    {
			$params['search'] = esc($params['search']);
			$builder->where("(users.username LIKE '$params[search]%' ESCAPE '!' OR users.email LIKE '$params[search]%' ESCAPE '!' OR users.othernames LIKE '$params[search]%' ESCAPE '!' OR users.lastname LIKE '$params[search]%' ESCAPE '!' OR user_roles.user_role_name LIKE '$params[search]%' ESCAPE '!')");
		}
		
		// if it is a search
	    if(isset($params['term']))
	    {
			$params['term'] = esc($params['term']);
			$builder->where("(users.username LIKE '$params[term]%' ESCAPE '!' OR  users.othernames LIKE '$params[term]%' ESCAPE '!' OR users.lastname LIKE '$params[term]%' ESCAPE '!')");
	    }
	    
	    // Ensure only records that have not been deleted are filtered
	    $builder->where(['users.deleted_at'=> NULL]);
	    
	}
	
	// Get all the available users in the database
	function getAll($param=array(), $offset=0, $limit=10)
	{
		$builder = $this->db->table('users');
		$builder->select('users.id, users.othernames, users.lastname, users.user_role_id, users.username, users.user_status, users.created_at, user_roles.user_role_name');
		$builder->join('user_roles', 'users.user_role_id = user_roles.id', "left");
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		// Add the limits
		$builder->limit($limit, $offset);
		// Add ordering to it
		$builder->orderBy('users.lastname', 'asc');
		$builder->orderBy('users.othernames', 'asc');
		// Execute
		$query = $builder->get();
		return $query->getResultArray();
	}
	
	// Get count of all the available users in the database
	function getAllCount($param=array())
	{
		$builder = $this->db->table('users');
		$builder->join('user_roles', 'users.user_role_id = user_roles.id', "left");
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		// Get and return the count of all the result
		return $builder->countAllResults();
	}

	function findUser($param=array(), $offset=0, $limit=100)
	{
		$builder = $this->db->table('users');
		$builder->select('users.id, users.othernames, users.lastname, users.username, users.employee_id');
		$builder->join('user_roles', 'users.user_role_id = user_roles.id', "left");
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		// Add the limits
		$builder->limit($limit, $offset);
		$query = $builder->get();
		return $query->getResultArray();
	}

	function getUserDetails($id)
	{
		$builder = $this->db->table('users');
		$fields = "users.id, users.othernames, users.lastname, users.username, users.phone_number, users.email, users.user_role_id, users.pending_edit, users.access_type, users.user_image_path, users.user_status, user_roles.user_role_name, admin.othernames as created_by_othernames, admin.lastname as created_by_lastname";
		$builder->select($fields);
		$builder->join('user_roles', 'users.user_role_id = user_roles.id', "left");
		$builder->join('users admin', 'users.created_by = admin.id', "left");
		// call the filtering function incase there is any
		$this->queryParameters($builder);
		// Add the limits
		$builder->where(['users.id'=>$id]);
		// Execute
		$query = $builder->get();
		return $query->getRowArray();
	}

	// Method to get form input and perform validations required
	function getFormInput($request, $utility)
	{
		// Get the JSON data from the request
		$json_data = $request->getJSON(true);
		// Now pass the data into a new array
		$_data = [
			'othernames'	=> @$json_data['othernames'],
			'lastname' 		=> @$json_data['lastname'],
			'phone_number' 	=> @$json_data['phone_number'],
			'user_role_id' 	=> @$json_data['user_role_id'],
			'email' 		=> @$json_data['email'],
			'username' 		=> @$json_data['username'],
			'password' 		=> @$json_data['password'],
			'repassword' 	=> @$json_data['repassword']
		];
		// Load the form validation service
		$validation =  \Config\Services::validation();
		// Perform the form validations required
		if ($validation->run($_data, 'new_user') == FALSE){
			$message = $utility->processValidationErrorMessages($validation->getErrors());
			$response = array("status"=>"failed", 'message'=>$message);
		}
		else{
			unset($_data['repassword']);
			$response = array("status"=>"success", 'data'=>$_data);
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
			'othernames'	=> @$json_data['othernames'],
			'lastname' 		=> @$json_data['lastname'],
			'phone_number' 	=> @$json_data['phone_number'],
			'user_role_id' 	=> @$json_data['user_role_id'],
		];
		// Load the form validation service
		$validation =  \Config\Services::validation();
		// Perform the form validations required
		if ($validation->run($_data, 'edit_user') == FALSE){
			$message = $utility->processValidationErrorMessages($validation->getErrors());
			$response = array("status"=>"failed", 'message'=>$message);
		}
		else{
			$response = array("status"=>"success", 'data'=>$_data, 'id'=>@$json_data['id']);
		}
		// Return the response
		return $response;
	}

	// Method to get the account id of a specified user
	function getUserAccountId($user_id)
	{
		$builder = $this->db->table('users');
		$fields = "users.id, users.othernames, users.lastname, users.username, users.phone_number, users.email, users.user_role_id, users.user_status, users.force_password_change, user_roles.user_role_name";
		$builder->select($fields);
		$builder->join('companies', 'users.company_id = companies.id', "left");
		$builder->join('user_roles', 'users.user_role_id = user_roles.id', "left");
		// call the filtering function incase there is any
		$this->queryParameters($builder);
		// Add the limits
		$builder->where(['users.id'=>$user_id]);
		// Execute
		$query = $builder->get();
		return $query->getRowArray();
	}
	// Method to increase the login attempts of a given user
	//function updateLoginAttempt
}
