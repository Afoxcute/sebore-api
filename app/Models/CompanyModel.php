<?php namespace App\Models;

use CodeIgniter\Model;

class CompanyModel extends Model
{
	protected $table      = 'accounts';
    protected $primaryKey = 'id';

    protected $returnType     = 'array';
    protected $useSoftDeletes = true;

	protected $allowedFields = ['company_description', 'business_category_id', 'company_address', 'company_status', 'account_id', 'is_deleted', 'country_id'];
	
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
	protected $deletedField  = 'deleted_at';
	
	/*protected $validationRules    = [
		'othernames'    => 'required',
		'lastname'     => 'required',
		'phone_number' => 'required',
		'username'     => 'required|alpha_numeric_space|min_length[6]|is_unique[users.username]',
        'email'        => 'required|valid_email|is_unique[users.email]'
    ];*/
	
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
	    
	    // if it is a search
	    if(isset($params['search'])){
			$params['search'] = esc($params['search']);
			$builder->where("(companies.company_description LIKE '$params[search]%' ESCAPE '!')");
		}
		
		// if it is a search
	    if(isset($params['term']))
	    {
			$params['term'] = esc($params['term']);
			$builder->where("(companies.company_description LIKE '$params[search]%' ESCAPE '!')");
	    }
	    
	    // Ensure only records that have not been deleted are filtered
	    $builder->where(['companies.deleted_at'=> NULL]);
	    
	}
	
	// Get all the available accounts in the database
	function getAll($param=array(), $offset=0, $limit=10)
	{
		$builder = $this->db->table('companies');
		$builder->select('companies.id, companies.company_description, companies.company_address, companies.business_category_id, companies.company_status, companies.account_id, companies.country_id, companies.created_at');
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		// Add the limits
		$builder->limit($limit, $offset);
		// Add ordering to it
		$builder->orderBy('accounts.company_description', 'asc');
		// Execute
		$query = $builder->get();
		return $query->getResultArray();
	}
	
	// Get count of all the available accounts in the database
	function getAllCount($param=array())
	{
		$builder = $this->db->table('companies');
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		// Get and return the count of all the result
		return $builder->countAllResults();
	}

	// Method to fetch company full information
	function getDetails($company_id)
	{
		$builder = $this->db->table('companies');
		$builder->select('companies.id, companies.company_description, companies.company_address, companies.business_category_id, companies.company_status, companies.account_id, companies.country_id, companies.created_at, countries.country_description, countries.timezone, accounts.account_status, accounts.setup_status, business_categories.business_category_description');
		$builder->join('accounts', 'companies.account_id = accounts.id', 'left');
		$builder->join('countries', 'companies.country_id = countries.id', 'left');
		$builder->join('business_categories', 'companies.business_category_id = business_categories.id', 'left');
		// call the filtering function incase there is any
		$this->queryParameters($builder);
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
			'company_description'		=> @$json_data['company_description'], 
			'company_address' 		    => @$json_data['company_address'], 
			'business_category_id' 	    => @$json_data['business_category_id'],
            'country_id' 		        => @$json_data['country_id'],
            'company_status'            => 0
		];
		// Load the form validation service
		$validation =  \Config\Services::validation();
		// Perform the form validations required
		if ($validation->run($_data, 'new_company') == FALSE){
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
