<?php namespace App\Controllers;

class Home extends BaseController
{
	public function index()
	{
		$urlBits = explode('.', $_SERVER['HTTP_HOST'])[1];
		$response = ["code"=>200, "status"=>"success", 'message'=>'Welcome to Yaraa.io API', 'x'=>$urlBits];
		// Set the headers
		$this->response->setHeader('Access-Control-Allow-Origin', '*');
		$this->response->setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		$this->response->setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
		$this->response->setHeader('Content-type', 'application/json');
		$this->response->setHeader('Cache-Control', 'no-cache, must-revalidate');
        // Return the output as a JSON object
		return $this->response->setJSON($response);
	}

	public function options(): Response
    {
        return $this->response->setHeader('Access-Control-Allow-Origin', '*') //for allow any domain, insecure
            ->setHeader('Access-Control-Allow-Headers', '*') //for allow any headers, insecure
            ->setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE') //method allowed
            ->setStatusCode(200); //status code

		// header("Access-Control-Allow-Origin: *");
		// header("Access-Control-Allow-Headers: *");
		// header("Access-Control-Allow-Methods: *");
		// http_response_code(202);
    }
}
