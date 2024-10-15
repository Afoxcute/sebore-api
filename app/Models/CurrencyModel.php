<?php namespace App\Models;

use CodeIgniter\Model;

class CurrencyModel extends Model
{
	protected $table      = 'currencies';
    protected $primaryKey = 'id';

    protected $returnType     = 'array';
    protected $useSoftDeletes = true;

	protected $allowedFields = ['currency_description', 'currency_iso', 'currency_symbol', 'currency_status', 'account_id', 'is_deleted'];
	
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
	protected $deletedField  = 'deleted_at';
	
	// Model funtion to perform various filter actions
	function queryParameters($builder, $query_params=[])
	{
	    $params = array();
	    
	    // sanitize params and only pass along the ones with data
	    foreach ($query_params as $key => $value){
	        if ($value != '' && $value != NULL && $value != 'all' && $value != -1){
	            $params[$key] = $value;
	        }
	    }
	    
	    // if it is a search
	    if(isset($params['search'])){
			$params['search'] = esc($params['search']);
			$builder->where("(currencies.currency_description LIKE '$params[search]%' ESCAPE '!')");
		}
		
		// if it is a search
	    if(isset($params['term']))
	    {
			$params['term'] = esc($params['term']);
			$builder->where("(currencies.company_description LIKE '$params[search]%' ESCAPE '!')");
        }
        
        // If the filter is by id
	    if(isset($params['id'])){
			$builder->where(['currencies.id'=>$params['id']]);
	    }
	    
	    // Ensure only records that have not been deleted are filtered
	    $builder->where(['currencies.deleted_at'=> NULL]);
	    
	}
	
	// Get all the available accounts in the database
	function getAll($param=array(), $offset=0, $limit=10)
	{
		$builder = $this->db->table('currencies');
		$builder->select('currencies.id, currencies.currency_description, currencies.currency_iso, currencies.currency_symbol, currencies.currency_status, currencies.created_at');
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		// Add the limits
		$builder->limit($limit, $offset);
		// Add ordering to it
		$builder->orderBy('currencies.currency_description', 'asc');
		// Execute
		$query = $builder->get();
		return $query->getResultArray();
	}
	
	// Get count of all the available accounts in the database
	function getAllCount($param=array())
	{
		$builder = $this->db->table('currencies');
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		// Get and return the count of all the result
		return $builder->countAllResults();
	}
}