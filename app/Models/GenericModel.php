<?php namespace App\Models;

use CodeIgniter\Model;

class GenericModel extends Model
{
	function add($data, $tablename)
	{
		$builder = $this->db->table($tablename);
		$builder->insert($data);
		return $this->db->insertID();
	}
	
	function addbatch($data, $tablename)
	{
		$builder = $this->db->table($tablename);
		// Perform the actual insertion
		$builder->insertBatch($data);
	}
	
	function edit($data, $id, $tablename)
	{
		$builder = $this->db->table($tablename);
		$builder->where(['id'=>$id]);
		$builder->update($data);
	}
	
	function editByConditions($data, $condition_array, $tablename)
	{
		$builder = $this->db->table($tablename);
		$builder->where($condition_array);
		$builder->update($data);
	}

	function editByIds($data, $id_array, $tablename)
	{
		$builder = $this->db->table($tablename);
		$builder->where_in('id', $id_array);
		$builder->update($data);
	}
	
	// Get all data from a table
	function getAll($tablename, $offset=NULL, $fieldlist=null, $orderbyfield=null, $d_order='ASC')
	{
		$builder = $this->db->table($tablename);
		if($fieldlist != null)
			$builder->select($fieldlist);
		// If limit is specified
		if($offset != NULL)
			$builder->limit(50, $offset);
		
		if($orderbyfield != NULL && $orderbyfield != '')
			$builder->orderBy("$tablename.$orderbyfield", $d_order);
		// Clause to only fetch data with deletedat field set to null
		$builder->where(array('is_deleted'=>0));
		// Query result
		$query = $builder->get();
		return $query->getResultArray();
	}
	
	// Get count of all records in a table
	function getCount($tablename)
	{
		$builder = $this->db->table($tablename);
		// Clause to only fetch data with deletedat field set to null
		$builder->where(array('deletedat'=>null));
		return $builder->countAllResults();
	}
	
	function getAllCount($tablename)
	{
		$builder = $this->db->table($tablename);
		// Clause to only fetch data with deletedat field set to null
		$builder->where(['is_deleted'=>0]);
		return $builder->countAllResults();
	}

	// Get data from specified table by id column
	function getByID($id, $tablename, $fieldlist=null)
	{
		$builder = $this->db->table($tablename);
		if($fieldlist != null)
			$builder->select($fieldlist);
		// Clause to only fetch data with deletedat field set to null
		$builder->where(['is_deleted'=>0]);
		$builder->where('id', $id);
		$query = $builder->get();
		return $query->getRowArray();
	}
	
	// Get table data by specified field
	function getByField($fieldname, $fieldvalue, $tablename, $fieldlist=null, $limit=NULL, $recordcount=50, $orderbyfield=null, $d_order='ASC')
	{
		$builder = $this->db->table($tablename);
		if($fieldlist != null)
			$builder->select($fieldlist);
		$builder->where($fieldname, $fieldvalue);
		// If limit is specified
		if($limit != NULL && trim($limit) != '')
			$builder->limit($recordcount, $limit);
		
		// Clause to only fetch data with deletedat field set to null
		$builder->where(array('is_deleted'=>0));
		$query = $builder->get();
		return $query->getResultArray();
	}
	
	function getByFieldCount($fieldname, $fieldvalue, $tablename, $fieldlist=null, $orderbyfield=null, $d_order='ASC')
	{
		$builder = $this->db->table($tablename);
		if($fieldlist != null)
			$builder->select($fieldlist);

		$builder->where($fieldname, $fieldvalue);	
		// Clause to only fetch data with deletedat field set to null
		$builder->where(array('is_deleted'=>0));
		return $builder->countAllResults();
	}
	
	function getByFieldSingle($fieldname, $fieldvalue, $tablename, $fieldlist=null)
	{
		$builder = $this->db->table($tablename);
		$builder->where($fieldname, $fieldvalue);
		// Clause to only fetch data with deletedat field set to null
		$builder->where(['is_deleted'=>0]);
		$query = $builder->get();
		return $query->getRowArray();
	}
	
	// Get count of all records in a table
	function getCountByField($fieldname, $fieldvalue, $tablename)
	{
		$builder = $this->db->table($tablename);
		$builder->where($fieldname, $fieldvalue);
		// Clause to only fetch data with deletedat field set to null
		$builder->where(array('is_deleted'=>0));
		return $builder->countAllResults();
	}
	
	// Delete specified table record by id
	function deleteRecord($id, $tablename)
	{
		$builder = $this->db->table($tablename);
		$builder->where(array('id'=>$id));
		$builder->update($tablename, ['deletedat'=>strtotime("now"), 'is_deleted'=>1]);
	}
	
	function findByCondition($condition_array, $tablename, $orderbyfield=null, $d_order='ASC', $limit=NULL, $offset=0)
	{
		$builder = $this->db->table($tablename);
		$builder->where($condition_array);
		// Clause to only fetch data with deletedat field set to null
		$builder->where(['is_deleted'=>0]);
		// If the order by field is set
		if($orderbyfield != NULL && $orderbyfield != ''){
			$builder->orderBy("$tablename.$orderbyfield", $d_order);
		}
		// If limit is specified
		if($limit != NULL && trim($limit) != '')
			$builder->limit($limit, $offset);
		// Query the database using the builder
		$query = $builder->get();
		return $query->getResultArray();
	}

	function findByConditionSingle($condition_array, $tablename, $orderbyfield=null, $d_order='ASC', $limit=NULL, $offset=0)
	{
		$builder = $this->db->table($tablename);
		$builder->where($condition_array);
		// Clause to only fetch data with deletedat field set to null
		$builder->where(['is_deleted'=>0]);
		// If the order by field is set
		if($orderbyfield != NULL && $orderbyfield != ''){
			$builder->orderBy("$tablename.$orderbyfield", $d_order);
		}
		// If limit is specified
		if($limit != NULL && trim($limit) != '')
			$builder->limit($limit, $offset);
		// Get the data from the db
		$query = $builder->get();
		// Return the returned result
		return $query->getRowArray();
	}
}