<?php namespace App\Controllers;

use CodeIgniter\Controller;

use App\Models\CurrencyModel;
use App\Models\GenericModel;
use App\Models\SystemAuditModel;
use App\Models\UtilityModel;
use App\Models\ValidateSessionModel;

class Currencies extends BaseController
{
	function __construct()
	{
        // Create objects of the required models
        $this->currency = new CurrencyModel();
		$this->generic = new GenericModel();
		$this->audit = new SystemAuditModel();
		$this->utility = new UtilityModel();
		$this->sessionValidate = new ValidateSessionModel();
		// Set the HTTP Request object
		$this->request = \Config\Services::request();
		// Set the HTTP Response object
		$this->response = \Config\Services::response();
		// To set the output content types when the request is an ajax request
		if($this->request->isAJAX())
		{
			$this->response->setHeader('Content-type', 'application/json');
			$this->response->setHeader('Access-Control-Allow-Origin', '*');
			$this->response->setHeader('Cache-Control', 'no-cache, must-revalidate');
		}
		// Set the X-Frame-Options header
		$this->response->setHeader('X-Frame-Options', 'SAMEORIGIN');
		// Get the user agent and make it available globally
        $this->agent = $this->request->getUserAgent();
        // Get any filter options for this page call
		$this->filterparams['term'] = $this->request->getGetPost('term');
		$this->filterparams['search'] = $this->request->getGet('search[value]');
	}

	// Controller function to list all admin states on the platform
	public function index()
	{
        $this->sessionValidate->validatePublic($this->request);
		// Return the output as a JSON object
		return $this->response->setJSON(["status"=>"success", 'message'=>'Currencies end-points']);
	}

	// Controller function to get states list and reply with JSON
	public function get($_id = NULL)
	{
        $this->sessionValidate->validatePublic($this->request);
        // Fetch any limits or offset from the db
		$offset = ($this->request->getGet('offset') == '') ? 0 : $this->request->getGetPost('offset');
        $length = ($this->request->getGet('limit') == '') ? 10 : $this->request->getGetPost('limit');
        // Get any available filter options
        $filterparams = $this->filterparams;
        // Get method to fetch the data
		$filterparams['id'] = ($_id == NULL) ? $this->request->getGetPost('id') : $_id;
	    // Set default color
	    $records = $this->currency->getAll($filterparams, $offset, $length);
	    $records_count = $this->currency->getAllCount($filterparams);
	    $data = ["status"=>"success", "draw" => 0, "recordsFiltered" => $records_count, "recordsTotal" => $records_count, "data" => $records];
		// Return the output as a JSON object
		return $this->response->setJSON($data);
	}
}