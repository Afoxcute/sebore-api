<?php namespace App\Models;

use CodeIgniter\Model;

class Role_assignmentModel extends Model
{
	protected $table      = 'role_assignments';
    protected $primaryKey = 'id';

    protected $returnType     = 'array';
    protected $useSoftDeletes = true;

	protected $allowedFields = ['role_id', 'module_id', 'permitted', 'is_deleted'];
	
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
	protected $deletedField  = 'deleted_at';

	function getAll()
	{
		$builder = $this->db->table('role_assignments');
		$query = $builder->get();
		return $query->getResultArray();
	}

	function roleAccess($role_id, $controller_name, $access_type=NULL)
	{
		$builder = $this->db->table('role_assignments');
		$builder->select('role_assignments.id, system_modules.access_type');
		$builder->join('system_modules', 'role_assignments.module_id  = system_modules.id');
		$builder->where(['role_id'=>$role_id, 'controller_name'=>$controller_name, 'permitted'=>1]);
		// Execute
		$query = $builder->get();
		$row = $query->getRowArray();
		if(is_array($row) && !empty($row))
			return true;
		else
			return false;
	}

	function roleModules($role_id)
	{
		$builder = $this->db->table('role_assignments');
		$builder->select('role_assignments.id, system_modules.access_type');
		$builder->join('system_modules', 'role_assignments.module_id  = system_modules.id');
		$builder->where(['role_id'=>$role_id]);
		// Execute
		$query = $builder->get();
		$row = $query->getRowArray();
		if(is_array($row) && !empty($row))
			return true;
		else
			return false;
	}

	function roleAssignmentStatus($role_id, $module_id)
	{
		$builder = $this->db->table('role_assignments');
		$builder->where(array('role_id'=>$role_id, 'module_id'=>$module_id, 'permitted'=>1));
		// Execute
		$query = $builder->get();
		$row = $query->getRowArray();
		if(is_array($row) && !empty($row))
			return true;
		else
			return false;
	}

	function roleAssignmentDetails($role_id)
	{
		$builder = $this->db->table('role_assignments');
		$builder->select('role_assignments.id, system_modules.access_type, role_assignments.permitted, system_modules.controller_name');
		$builder->join('system_modules', 'role_assignments.module_id  = system_modules.id', 'left');
		$builder->where(array('role_id'=>$role_id, 'role_assignments.permitted'=>1));
		// Execute
		$query = $builder->get();
		return $query->getResultArray();
	}
}