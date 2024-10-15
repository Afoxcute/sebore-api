<?php namespace App\Models;

use CodeIgniter\Model;

class AccountModel extends Model
{
	protected $table      = 'accounts';
    protected $primaryKey = 'id';

    protected $returnType     = 'array';
    protected $useSoftDeletes = true;

	protected $allowedFields = ['othernames', 'lastname', 'email', 'phone_number', 'is_deleted'];
	
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
	protected $deletedField  = 'deleted_at';
	
	protected $validationRules    = [
		'othernames'    => 'required',
		'lastname'     => 'required',
		'phone_number' => 'required',
		'username'     => 'required|alpha_numeric_space|min_length[6]|is_unique[users.username]',
        'email'        => 'required|valid_email|is_unique[users.email]'
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
		
		// Filter accounts by id
	    if(isset($params['account_id'])){
			$builder->where(['accounts.id'=>$params['account_id']]);
		}

		// Filter accounts by id
	    if(isset($params['id'])){
			$builder->where(['accounts.id'=>$params['id']]);
		}

		// Filter accounts by email
	    if(isset($params['email'])){
			$builder->where(['accounts.email'=>$params['email']]);
		}

		// Filter accounts by phone
	    if(isset($params['phone_number'])){
			$builder->where(['accounts.phone_number'=>$params['phone_number']]);
		}

	    // if it is a search
	    if(isset($params['search'])){
			$params['search'] = esc($params['search']);
			$builder->where("(accounts.username LIKE '$params[search]%' ESCAPE '!' OR users.email LIKE '$params[search]%' ESCAPE '!' OR users.othernames LIKE '$params[search]%' ESCAPE '!' OR users.lastname LIKE '$params[search]%' ESCAPE '!' OR user_roles.user_role_name LIKE '$params[search]%' ESCAPE '!')");
		}
		
		// if it is a search
	    if(isset($params['term'])){
			$params['term'] = esc($params['term']);
			$builder->where("(accounts.username LIKE '$params[term]%' ESCAPE '!' OR  accounts.othernames LIKE '$params[term]%' ESCAPE '!' OR accounts.lastname LIKE '$params[term]%' ESCAPE '!')");
		}
	    
	    // Ensure only records that have not been deleted are filtered
	    $builder->where(['accounts.is_deleted'=> 0]);
	    
	}
	
	// Get all the available accounts in the database
	function getAll($param=[], $offset=0, $limit=10)
	{
		$builder = $this->db->table('accounts');
		$builder->select('accounts.id, accounts.othernames, accounts.lastname, accounts.email, accounts.phone_number, accounts.account_status, accounts.created_at');
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		// Add the limits
		$builder->limit($limit, $offset);
		// Add ordering to it
		$builder->orderBy('accounts.lastname', 'asc');
		$builder->orderBy('accounts.othernames', 'asc');
		// Execute
		$query = $builder->get();
		return $query->getResultArray();
	}
	
	// Get count of all the available accounts in the database
	function getAllCount($param=[])
	{
		$builder = $this->db->table('accounts');
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		// Get and return the count of all the result
		return $builder->countAllResults();
	}

	// Method to prepare the activation email
	function getAccountActivation($account_id){
		$builder = $this->db->table('account_activations');
		$builder->select('account_activations.*, accounts.lastname, accounts.othernames, accounts.email');
		$builder->join('accounts', 'account_activations.account_id = accounts.id', 'left');
		$builder->where(['account_activations.account_id'=>$account_id, 'accounts.is_deleted'=>0, 'account_activations.activated'=>0]);
		// call the filtering function incase there is any
		$query = $builder->get();
		return $query->getRowArray();
	}

	// Method to collect all the sign-up inputs
	public function getSignUpInputs($request, $utility, $company, $user)
	{
		// Get the account inputs
		$_account_inputs = $this->getFormInput($request, $utility);
		// Get the company inputs
		$_company_inputs = $company->getFormInput($request, $utility);
		// Get the user inputs
		$_user_inputs = $user->getFormInput($request, $utility);
		// Now evaluate the inputs
		if($_account_inputs['status'] == 'success' && $_company_inputs['status'] == 'success' && $_user_inputs['status'] == 'success')
			return ['status'=>'success', 'account'=>$_account_inputs['data'], 'company'=>$_company_inputs['data'], 'user'=>$_user_inputs['data']];
		else if($_account_inputs['status'] == 'failed')
			return $_account_inputs;
		else if($_company_inputs['status'] == 'failed')
			return $_company_inputs;
		else if($_user_inputs['status'] == 'failed')
			return $_user_inputs;
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
			'email' 		=> @$json_data['email'],
			'country_id'	=> @$json_data['country_id'],
		];
		// Load the form validation service
		$validation =  \Config\Services::validation();
		// Perform the form validations required
		if ($validation->run($_data, 'new_account') == FALSE){
			$message = $utility->processValidationErrorMessages($validation->getErrors());
			$response = array("status"=>"failed", 'message'=>$message);
		}
		else{
			$response = array("status"=>"success", 'data'=>$_data);
		}
		// Return the response
		return $response;
	}

	// Method to get form input and perform validations required
	function getFormInputEdit($request, $utility)
	{
		$_data = [
			'firstname'		=> $request->getPost('firstname'), 
			'lastname' 		=> $request->getPost('lastname'), 
			'phone_number' 	=> $request->getPost('phone_number'),
			'email' 		=> $request->getPost('email'),
		];
		// Load the form validation service
		$validation =  \Config\Services::validation();
		// Perform the form validations required
		if ($validation->run($_data, 'edit_account') == FALSE){
			$message = $utility->processValidationErrorMessages($validation->getErrors());
			$response = array("status"=>"failed", 'message'=>$message);
		}
		else{
			$response = array("status"=>"success", 'data'=>$_data);
		}
		// Return the response
		return $response;
	}
}
