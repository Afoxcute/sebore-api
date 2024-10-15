<?php namespace App\Models;

use CodeIgniter\Model;

class SystemAuditModel extends Model
{
	protected $table      = 'system_audit';
    protected $primaryKey = 'id';

    protected $returnType     = 'array';
	protected $useSoftDeletes = true;

	protected $allowedFields = ['user_id', 'ip_address', 'action_type', 'action_performed', 'date_time', 'platform', 'browser', 'user_agent', 'is_deleted'];
	
    protected $useTimestamps = true;
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
	protected $deletedField  = 'deleted_at';
	
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
	    
	    // filter transaction by user role
	    if(isset($params['userid']))
	    {
	        $builder->where(array('system_audit.userid'=>$params['userid']));
	    }
	    
	    if(isset($params['createdat']) && !empty($params['createdat']))
	    {
	        $t_date = explode("-", $params['createdat']);
	        $startdate = date("Y-m-d", strtotime($t_date[0]));
	        $enddate = date("Y-m-d", strtotime($t_date[1]));
	        $builder->where(array('system_audit.createdat >='=>$startdate, 'system_audit.createdat <='=>$enddate. ' 23:59:59'));
	    }
	    
	    // if it is a search
	    if(isset($params['search']))
	    {
	        $builder->where("(users.username LIKE'%$params[search]%' OR users.firstname LIKE'%$params[search]%' OR 
                users.lastname LIKE'%$params[search]%' OR system_audit.IPAddress = '$params[search]' OR system_audit.platform LIKE'%$params[search]%' OR system_audit.browser LIKE'%$params[search]%' OR DATE(system_audit.createdat) = '$params[search]')");
	    }
	    
	    // Restrict the data based on the user type (customer user)
	    if($this->session->accesstype == 2){
	        $builder->where(array("users.customerid"=>$this->session->customerid));
	    }

	    // Restrict a depot user to only view user accounts inside his depot
	    if($this->session->sap_plant_id != null){
	    	$builder->where(array("users.sap_plant_id"=>$this->session->sap_plant_id));
	    }
	    
	    // Ensure only records that have not been deleted are filtered
	    $builder->where(array('system_audit.is_deleted'=>0));
	    
	}

	function add($data, $agent)
	{
		$data['ip_address'] = $_SERVER['REMOTE_ADDR'];
		$data['date_time'] = date('Y-m-d H:i');
		$data['browser'] = $agent->getBrowser();
		$data['user_agent'] = $agent->getAgentString();
		$data['platform'] = $agent->getPlatform();
		// Save the record
		$this->save($data);
	}

	// Get all the available users in the database
	function getAll($param=array(), $offset=0, $limit=10)
	{
		$builder = $this->db->table('system_audit');
		$builder->select('users.firstname, users.lastname, users.username, system_audit.IPAddress, system_audit.platform, system_audit.browser, system_audit.actionPerformed, system_audit.actionType, system_audit.createdat');
		$builder->join('users', 'system_audit.userid = users.id', "left");
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		// Add the limits
		$builder->limit($limit, $offset);
		// Add ordering to it
		$builder->order_by('system_audit.createdat', 'desc');

		// if the user is an admin user, ensure he is not tied to a specific plant
	    if($this->session->accesstype == 1 && $this->session->sap_plant_id > 0){
	    	$builder->where(['users.sap_plant_id'=>$this->session->sap_plant_id]);
	    }

		$query = $builder->get();
		return $query->getResultArray();
	}
	
	// Get count of all the available users in the database
	function getAllCount($param=array())
	{
		$builder = $this->db->table('system_audit');
		$builder->join('users', 'system_audit.userid = users.id', "left");
		// call the filtering function incase there is any
		$this->queryParameters($builder, $param);
		// if the user is an admin user, ensure he is not tied to a specific plant
	    if($this->session->accesstype == 1 && $this->session->sap_plant_id > 0){
	    	$builder->where(['users.sap_plant_id'=>$this->session->sap_plant_id]);
	    }
		return $builder->countAllResults();
	}
}