<?php namespace App\Models;

use CodeIgniter\Model;

class Auth_clientModel extends Model
{
	protected $table      = 'auth_clients';
    protected $primaryKey = 'id';

    protected $returnType     = 'array';
    protected $useSoftDeletes = true;

	protected $allowedFields = ['user_id', 'token', 'company_id', 'expires_on', 'client_id', 'is_deleted'];
	
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
	protected $deletedField  = 'deleted_at';
	
	protected $validationRules    = [
		'secret_key'       => 'required',
		'public_key'       => 'required',
    ];
    
	// Method to get client data from the database
	function getClient($client_id, $public_key)
	{
		$builder = $this->db->table('auth_clients');
        $builder->select('auth_clients.id, auth_clients.public_key');
        // Add where clause to pick only records not deleted
		$builder->where(['auth_clients.is_deleted'=>0, 'auth_clients.id'=>$client_id, 'auth_clients.public_key'=>$public_key]);
		// Execute
		$query = $builder->get();
		return $query->getRowArray();
	}
    
    // Method to verify the client
    function verifyClient($request)
    {
        // Call method to get the token from the header
        $_data = $this->fetchClientFromRequest($request);
		if(is_array($_data) && !empty($_data)){
            // Get the details of the client
            $_client = $this->getClient($_data['client_id'], $_data['public_key']);
            // Ensure the token has not expired
            if(is_array($_client) && !empty($_client))
                return ['status'=>'success', 'message'=>'Client verified'];
            else
                return ['status'=>'failed', 'code'=>400, 'message'=>'Invalid Client'];
        }
        else
            return ['status'=>'failed', 'code'=>401, 'message'=>'Client details have not been supplied'];
    }

    // Method to extract the client data from the header
    function fetchClientFromRequest($request)
    {
        $client = [];
        // Check if the bearer token is set
		if($request->hasHeader('Client-ID') == true && $request->hasHeader('Client-Key') == true){
            $client = ['client_id'=>$request->getHeaderLine('Client-ID'), 'public_key'=>$request->getHeaderLine('Client-Key')];
        }
        return $client;
    }
}