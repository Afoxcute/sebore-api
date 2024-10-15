<?php namespace App\Models;

use CodeIgniter\Model;

class LgaModel extends Model
{
	// Model funtion to perform various filter actions
	function queryParameters($query_params=array())
	{
	    $params = array();
	    // sanitize params and only pass along the ones with data
	    foreach ($query_params as $key => $value)
	    {
	        if ($value != '' && $value != NULL && $value != 'all' && $value != -1)
	            $params[$key] = $value;
	    }
		
		// filter by state name
	    if(isset($params['lga_name']))
	    {
	        $this->db->where(array("lgas.lga_name"=>$params['lga_name']));
		}

		// filter by zone id option
	    if(isset($params['region_id']))
	    {
	        $this->db->where(array("states.region_id"=>$params['region_id']));
		}

		// filter by state id option
	    if(isset($params['state_id']))
	    {
	        $this->db->where(array("lgas.state_id"=>$params['state_id']));
		}

		// filter by state id option
	    if(isset($params['state_id']))
	    {
	        $this->db->where(array("lgas.state_id"=>$params['state_id']));
		}
		
	    if(isset($params['createdat']) && !empty($params['createdat']))
	    {
	        $t_date = explode("-", $params['createdat']);
	        $startdate = date("Y-m-d", strtotime($t_date[0]));
	        $enddate = date("Y-m-d", strtotime($t_date[1]));
	        $this->db->where(array('lgas.createdat >='=>$startdate, 'lgas.createdat <='=>$enddate. ' 23:59:59'));
	    }
	    
	    // if it is a search
	    if(isset($params['search']))
	    {
	        $this->db->where("(lgas.lga_name LIKE'%$params[search]%' OR states.state_name LIKE'%$params[search]%')");
	    }
	    
	    /*// Restrict the data to see only lga if applies
	    if($this->session->lga_id > 0){
	        $this->db->where(array("lgas.id"=>$this->session->lga_id));
	    }*/
	    
	    // Ensure only records that have not been deleted are filtered
	    $this->db->where(array('lgas.is_deleted'=>0));
	    
	}
	
	// Get all the available lgas in the database
	function getAll($param=array(), $offset=0, $limit=10)
	{
		$this->db->select('lgas.id, lgas.lga_name, lgas.lga_code, lgas.createdat, states.state_name');
		$this->db->from('lgas');
		$this->db->join('states', 'lgas.state_id = states.id', 'left');
		// call the filtering function incase there is any
		$this->queryParameters($param);
		// Add the limits
		$this->db->limit($limit, $offset);
		// Add ordering to it
		$this->db->orderBy('lgas.lga_name', 'asc');
		// Execute
		$query = $this->db->get();
		return $query->result_array();
	}
	
	// Get count of all the available lgas in the database
	function getAllCount($param=array())
	{
		$this->db->from('lgas');
		$this->db->join('states', 'lgas.state_id = states.id', 'left');
		// call the filtering function incase there is any
		$this->queryParameters($param);
		return $this->db->count_all_results();
	}

	// Method to get all LGAs for use in select fields
	function loadAll($param=array())
	{
		$this->db->select('lgas.id, lgas.lga_name');
		$this->db->from('lgas');
		$this->db->join('states', 'lgas.state_id = states.id', 'left');
		// call the filtering function incase there is any
		$this->queryParameters($param);
		// Add ordering to it
		$this->db->orderBy('lgas.lga_name', 'asc');
		// Execute
		$query = $this->db->get();
		return $query->result_array();
	}

	// Get all the available lgas in the database
	function findLGAData($lga_name, $state_name, $param=array())
	{
		$this->db->select('lgas.id, lgas.lga_name, lgas.lga_code, lgas.state_id, lgas.createdat, states.state_name');
		$this->db->from('lgas');
		$this->db->join('states', 'lgas.state_id = states.id', 'left');
		// call the filtering function incase there is any
		$this->queryParameters($param);
		// Add ordering to it
		$this->db->where(array('lgas.lga_name'=>$lga_name, 'states.state_name'=>$state_name));
		// Execute
		$query = $this->db->get();
		return $query->row_array();
	}
}
