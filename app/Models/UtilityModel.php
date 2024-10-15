<?php namespace App\Models;

use CodeIgniter\Model;
use App\Models\GenericModel;

class UtilityModel extends Model
{	
	//Function to process CSV file uploads
	function uploadCSV($url)
	{
		$csvarray = array($url);
	    if (file_exists($url) and is_file($url)) {
	        if (($handle = fopen($url, "r")) !== false) {
	            $nn = 0;
	            while (($data = fgetcsv($handle, 1000, ",")) !== false) {
	                $c = count($data);
	                for ($x = 0; $x < $c; $x++) {
	                    $csvarray[$nn][$x] = trim($data[$x]);
	                }
	                $nn++;
	            }
	            fclose($handle);
	        }
	    }
	    return $csvarray;
	}
	
	function formatNumber($number)
	{
		if(substr($number,0,4) == '+234')
			$number = substr($number, 3);
		else if(substr($number,0,3) == '234')
			$number = substr($number, 2);
		else if(substr($number,0,1) == '0')
			$number = $number;
		else 
			$number = '0'.$number;
		
		return $number;
	}
	
	function thisWeekTimestamps()
	{
		$res['weekstart'] = strtotime('last sunday');
		$res['weekend'] = strtotime('this sunday');
		return $res;
	}
	
	function thisMonthTimestamps()
	{
		$res['monthstart'] = strtotime('first day of this month');
		$res['monthend'] = strtotime('last day of this month');
		return $res;
	}
	
	function todayTimestamps()
	{
		$res['daystart'] = strtotime(date("Y-m-d"));
		$res['dayend'] = strtotime(date("Y-m-d")." 23:59");
		return $res;
	}
	
	function generateCode()
	{
		$rand = mt_rand(0x000000, 0xffffff); // generate a random number between 0 and 0xffffff
		$rand = dechex($rand & 0xffffff); // make sure we're not over 0xffffff, which shouldn't happen anyway
		$rand = str_pad($rand, 6, '0', STR_PAD_LEFT); // add zeroes in front of the generated string
		$code = date('d')."".$rand.date('m');
		return strtoupper($code);
	}
	
	function generateSecretKey($merchantcode, $merchantwebsite)
	{
		$rand = mt_rand(0x000000, 0xffffff); // generate a random number between 0 and 0xffffff
		$rand = dechex($rand & 0xffffff); // make sure we're not over 0xffffff, which shouldn't happen anyway
		$rand = str_pad($rand, 6, '0', STR_PAD_LEFT); // add zeroes in front of the generated string
		$code = date('d')."".$rand.date('ms');
		$token = strtoupper($code) . $merchantcode . $merchantwebsite . date('H:i:sdmy');
		
		$secrey_key = hash("sha512", $token);
		return strtoupper($secrey_key);
	}
	
	public function makePostCall($url, $params, $headers=NULL)
	{
		$fields = '';
		foreach($params as $key => $value) {
			$fields .= $key . '=' . urlencode($value) . '&';
		}
		rtrim($fields, '&');
		$post = curl_init();
		curl_setopt($post, CURLOPT_URL, $url);
		curl_setopt($post, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($post, CURLOPT_POST, count($params));
		curl_setopt($post, CURLOPT_POSTFIELDS, $fields);
		// If there are any headers present
		if($headers != NULL)
			curl_setopt($post, CURLOPT_HTTPHEADER, $headers);
		// Execute the CURL request
		$result = curl_exec($post);
		if(curl_errno($post))
			return false;
		curl_close($post);
		// Convert output to array
		return json_decode($result, true);
	}
	
	public function makeGetCall($url, $params=[], $headers=[])
	{
		$client = \Config\Services::curlrequest();
		$response = $client->request('GET', $url, ['query' => $params, 'http_errors' => false, 'headers'=>$headers]);
		$generic = new GenericModel();
		$generic->add(['request_json'=>json_encode($params), 'response_json'=>$response->getBody(), 'request_id'=>$url], 'apilogs');
		$http_code = $response->getStatusCode();
		if($http_code == 200){
			$body = json_decode($response->getBody(), TRUE);
			return ['http_code'=>$http_code, 'data'=>$body];
		}
		else if($http_code == 500){
			return ['http_code'=>$http_code, 'data'=>['code'=>"error", "message"=>"Internal Server Error Occured"]];
		}
		else if($http_code == 404){
			return ['http_code'=>$http_code, 'data'=>['code'=>"error", "message"=>"Resource is currently unavailable"]];
		}
		else{
			return ['http_code'=>$http_code, 'data'=>json_decode($response->getBody(), TRUE), 'body'=>$response->getBody()];
		}
	}

	public function makePostJSONCall($url, $_data, $headers=[])
	{
		$client = \Config\Services::curlrequest();
		$response = $client->request('POST', $url, ['json' => $_data, 'http_errors' => false, 'headers'=>$headers]);
		$generic = new GenericModel();
		$generic->add(['request_json'=>json_encode($_data), 'response_json'=>$response->getBody(), 'request_id'=>$url], 'apilogs');
		$http_code = $response->getStatusCode();
		if($http_code == 200){
			$body = json_decode($response->getBody(), TRUE);
			return ['http_code'=>$http_code, 'data'=>$body];
		}
		else if($http_code == 500){
			return ['http_code'=>$http_code, 'data'=>['code'=>"error", "message"=>"Internal Server Error Occured"]];
		}
		else if($http_code == 404){
			return ['http_code'=>$http_code, 'data'=>['code'=>"error", "message"=>"Resource is currently unavailable"]];
		}
		else{
			return ['http_code'=>$http_code, 'data'=>json_decode($response->getBody(), TRUE), 'body'=>$response->getBody()];
		}
	}
	
	public function formatFigures($value)
	{
		if($value == 0)
			return 0;
	
		$abbreviations = array(12 => 'T', 9 => 'B', 6 => 'M', 3 => 'K', 0 => '');
		foreach($abbreviations as $exponent => $abbreviation)
		{
			if($value >= pow(10, $exponent))
			{
				return round(floatval($value / pow(10, $exponent)),3).$abbreviation;
			}
				
		}
	}
	
	public function getFuturDate($interval="day", $value=0)
	{
		$d = date('Y-m-d H:i:s');
		$start_date = date("Y-m-d H:i:s", strtotime($d));
		$date = new DateTime($start_date);
		// Schedule expiry date
		$date->modify("+$value $interval");
		$expires = $date->format("Y-m-d H:i:s");
		return $expires;
	}

	public function _generateRandomString($length = 35)
	{
	    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	    $randomString = '';
	    for ($i = 0; $i < $length; $i++) {
	        $randomString .= $characters[rand(0, strlen($characters) - 1)];
	    }
	    return $randomString;
	}

	public function writeToFile($base64_string, $ext = "jpg", $upload_path = "uploads")
	{
	    $month = date('m-Y');
	    $upload_dir = "$upload_path/$month/";
	    
	    if(!is_dir($upload_dir)) {
	        mkdir($upload_dir, 0777);
	    }
	    
	    $image_binary = base64_decode($base64_string);
	    // organize the full file path
	    $filename = $upload_dir . $this->_generateRandomString();
	    $target_file =  $filename . '.' . $ext;
	    if ( ! write_file($target_file, $image_binary))
	    {
	        return "Could not upload! " . $target_file;
	    }
	    else
	    {
	        return $target_file;
	    }
	}
	
	// This method would format the form validation messages
	public function processValidationErrorMessages($error_array = [])
	{
		$_str = "";
		if(is_array($error_array) && !empty($error_array))
		{
			// Loop through each error item
			foreach ($error_array as $key => $value)
			{
				$_str .= "\n" . $value;
			}
		}
		return $_str;
	}
}
