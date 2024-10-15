<?php namespace App\Models;

use CodeIgniter\Model;

class System_moduleModel extends Model
{
	protected $table      = 'system_modules';
    protected $primaryKey = 'id';

    protected $returnType     = 'array';
    protected $useSoftDeletes = true;

	protected $allowedFields = ['controller_name', 'description', 'module_status', 'is_deleted'];
	
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
	protected $deletedField  = 'deleted_at';


	// Method to get all available roles and module
	function getAll($company_id=NULL)
	{
		$builder = $this->db->table('system_modules');
		$builder->where(['system_modules.is_deleted' => 0, 'system_modules.company_id'=>$company_id]);
		// Get the query
		$query = $builder->get();
		return $query->getResultArray();
	}
	
	// Method to get a single module
	function getModule($controller_name, $company_id=NULL)
	{
		$builder = $this->db->table('system_modules');
		$builder->where(['controler_name' => $controller_name, 'system_modules.is_deleted' => 0, 'system_modules.company_id'=>$company_id]);
		$query = $builder->get();
		return $query->getRowArray();
	}
}