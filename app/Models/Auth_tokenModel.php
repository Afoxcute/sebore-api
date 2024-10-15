<?php namespace App\Models;

use CodeIgniter\Model;

// import the user model into this class
use App\Models\Role_assignmentModel;

class Auth_tokenModel extends Model
{
	protected $table      = 'auth_tokens';
    protected $primaryKey = 'id';

    protected $returnType     = 'array';
    protected $useSoftDeletes = true;

	protected $allowedFields = ['user_id', 'token', 'company_id', 'expires_on', 'client_id', 'is_deleted'];
	
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
	protected $deletedField  = 'deleted_at';
	
	protected $validationRules    = [
		'user_id'       => 'required',
		'token'         => 'required',
		'company_id'    => 'required',
		'expires_on'    => 'required'
    ];
    
    // The class constructor
	/*function __construct()
	{
		// Create an object of the user model
		$this->roleAssign = new Role_assignmentModel();
		$this->utility = new UtilityModel();
    }*/
    
	// Get a specific token
	function getToken($token)
	{
		$builder = $this->db->table('auth_tokens');
        $builder->select('auth_tokens.token, auth_tokens.user_id, auth_tokens.expires_on, users.user_role_id, auth_tokens.company_id, auth_tokens.account_id, companies.company_description, user_roles.user_role_name');
        $builder->join('users', 'auth_tokens.user_id = users.id', "left");
        $builder->join('user_roles', 'users.user_role_id = user_roles.id', "left");
        $builder->join('companies', 'auth_tokens.company_id = companies.id', "left");
        // Add where clause to pick only records not deleted
		$builder->where(['auth_tokens.is_deleted'=>0, 'auth_tokens.token'=>$token]);
		// Execute
		$query = $builder->get();
		return $query->getRowArray();
	}
    
    // Validate token supplied to the API
    function validateToken($token)
    {
        // Get the token
        $_token = $this->getToken($token);
        // Verify the returned data is a non-empty array
		if(is_array($_token) && !empty($_token)){
            // Ensure the token has not expired
            if(strtotime('now') > $_token['expires_on'])
                return ['status'=>false, 'message'=>'expired'];
			else
				return ['status'=>true, 'message'=>'valid'];
        }
        else
            return ['status'=>false, 'message'=>'invalid'];
    }

    // Validate a user's token and also confirm token resource access
    function validateTokenAccess($module, $request)
    {
        // Call method to get the token from the header
        $token = $this->fetchTokenFromRequest($request);
        // Fetch the details of the token
        $_token = $this->getToken($token);
		if(is_array($_token) && !empty($_token)){
            // Ensure the token has not expired
            if(strtotime('now') > $_token['expires_on'])
                return ['status'=>false, 'message'=>'expired'];
            // Create object of role assignment
            $roleAssign = new Role_assignmentModel();
			//ensure user has the needed permition to access the method
			$permitted = $roleAssign->roleAccess($_token['user_role_id'], $module);
			if($permitted == true){
				return ['status'=>true, 'token'=>$token, 'token_data'=>$_token, 'message'=>'valid'];
			}
			else{
				return ['status'=>false, 'message'=>'accessdenied'];
			}
        }
        else
            return ['status'=>false, 'message'=>'invalid'];
    }

    // Method to extract the token from the header
    function fetchTokenFromRequest($request)
    {
        $token = '';
        // Check if the bearer token is set
		if($request->hasHeader('Authorization') == true)
		{
			// Get the authorization header
			$authorization = explode(' ', $request->getHeaderLine('Authorization'));
			// Fetch the token, from the array data
			$token = @$authorization[1];
        }
        return $token;
    }

    // Method to add items to the filter from the token(session)
    public function addTokenFilter($filterparams=[], $auth_token_data=[])
    {
        $filterparams['account_id'] = $auth_token_data['account_id'];
        $filterparams['company_id'] = $auth_token_data['company_id'];
        return $filterparams;
    }
}