<?php namespace App\Models;

use CodeIgniter\Model;

class StateModel extends Model
{
	// Model funtion to perform various filter actions
	function queryParameters($query_params=array())
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
	    
	    if(isset($params['createdat']) && !empty($params['createdat']))
	    {
	        $t_date = explode("-", $params['createdat']);
	        $startdate = date("Y-m-d", strtotime($t_date[0]));
	        $enddate = date("Y-m-d", strtotime($t_date[1]));
	        $this->db->where(array('states.createdat >='=>$startdate, 'states.createdat <='=>$enddate. ' 23:59:59'));
		}
		
		// filter by state id
		if(isset($params['state_id']))
	    {
	        $this->db->where(array('states.id'=>$params['state_id']));
		}

		// filter by region id
		if(isset($params['region_id']))
	    {
	        $this->db->where(array('states.region_id'=>$params['region_id']));
		}

		// filter by region id
		if(isset($params['regionid']))
	    {
	        $this->db->where(array('states.region_id'=>$params['region_id']));
		}
		
	    // if it is a search
	    if(isset($params['search']))
	    {
	        $this->db->where("(states.state_name LIKE'%$params[search]%' OR regions.region_name LIKE'%$params[search]%')");
	    }
	    
	    // Restrict the data to see only state if applies
	    if($this->session->state_id > 0){
	        $this->db->where(array("states.id"=>$this->session->state_id));
		}

		// Perform restrictions if the user is attached to specific region
	    if($this->session->region_id > 0){
	    	$this->db->where(array('states.region_id'=>$this->session->region_id));
		}
	    
	    // Ensure only records that have not been deleted are filtered
	    $this->db->where(array('states.is_deleted'=>0));
	    
	}
	
	// Get all the available states in the database
	function getAll($param=array(), $offset=0, $limit=10)
	{
		$this->db->select('states.id, states.state_name, states.fusion_id, states.createdat, regions.region_name');
		$this->db->from('states');
		$this->db->join('regions', 'states.region_id = regions.id', 'left');
		// call the filtering function incase there is any
		$this->queryParameters($param);
		// Add the limits
		$this->db->limit($limit, $offset);
		// Add ordering to it
		$this->db->order_by('states.state_name', 'asc');
		// Execute
		$query = $this->db->get();
		return $query->result_array();
	}
	
	// Get count of all the available states in the database
	function getAllCount($param=array())
	{
		$this->db->from('states');
		$this->db->join('regions', 'states.region_id = regions.id', 'left');
		// call the filtering function incase there is any
		$this->queryParameters($param);
		return $this->db->count_all_results();
	}

	// Method to get all states for use in select fields
	function loadAll($param=array())
	{
		$this->db->select('states.id, states.state_name, states.fusion_id, states.region_id, regions.region_name, regions.color_code');
		$this->db->from('states');
		$this->db->join('regions', 'states.region_id = regions.id', 'left');
		// call the filtering function incase there is any
		$this->queryParameters($param);
		// Add ordering to it
		$this->db->order_by('states.state_name', 'asc');
		// Execute
		$query = $this->db->get();
		return $query->result_array();
	}

	// Method to get state details
	public function fetchState($id)
	{
		$this->db->select('states.id, states.state_name, states.fusionid, states.region_id, regions.region_name, regions.color_code');
		$this->db->from('states');
		$this->db->join('regions', 'states.region_id = regions.id', 'left');
		$this->db->where(array('states.id'=>$id));
		// call the filtering function incase there is any
		$this->queryParameters();
		// Add ordering to it
		$this->db->order_by('states.state_name', 'asc');
		// Execute
		$query = $this->db->get();
		return $query->row_array();
	}
}
