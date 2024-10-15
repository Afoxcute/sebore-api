<?php namespace App\Controllers;

use CodeIgniter\Controller;

// Load the Google authentication library namespace
use App\Libraries\GoogleAuthenticator;

class Qr_generator extends BaseController 
{
	function __construct()
	{
		// Set the HTTP Request object
		$this->request = \Config\Services::request();
		// Set the HTTP Response object
		$this->response = \Config\Services::response();
	}

    function index()
	{

        // Set the required header for the controller
		header("Content-Type: image/png");
		// Generate the QR Code
        //$this->load->library('ciqrcode');
        $qr_data = 'otpauth://totp/ITEX Dashboard:' . $this->session->username . '?secret=' . $this->session->ga_secret . '&issuer=ITEX';
		// Set the required parameters for the library
		$params['data'] = $qr_data;
		$params['level'] = 'H';
		$params['size'] = 8;
		$this->ciqrcode->generate($params);
	}

	function test()
	{
		//$params['data'] = $qr_data;
		$params['level'] = 'H';
		$params['size'] = 8;
		$params['width'] = 150;
		$params['height'] = 150;

		$gaobj = new GoogleAuthenticator();
		$url = $gaobj->getQRCodeGoogleUrl('ITEX', "47346hdgdg4843g4478dg4frf4f4f", 'ITEX Dashboard', $params);
		echo "$url";
		return;
	}
}
