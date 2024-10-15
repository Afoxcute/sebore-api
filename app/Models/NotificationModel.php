<?php namespace App\Models;

use CodeIgniter\Model;

class NotificationModel extends Model
{
	public function sendEmail($message, $recipientemail, $subject, $copy_addresses="", $attachment=NULL, $send_immediately=false)
	{
		$this->sendMailByMailgun($message, $subject, $recipientemail, $attachment, $copy_addresses);
	}

	function sendMailByMailgun($message, $subject, $recipientemail, $attachment=NULL, $copy_addresses="")
	{
	    $array_data = array(
	        'from'=> 'Yaraa.io <no-reply@yaraa.io>',
	        'to'=>$recipientemail,
	        'subject'=>$subject,
	        'html'=>$message,
	        'attachment'[1] => '@'. realpath($attachment)
	    );
	    
	    if(trim($copy_addresses) != "")
	    {
	        $array_data = array(
	            'from'=> 'Yaraa.io <no-reply@yaraa.io>',
	            'to'=>$recipientemail,
	            'cc' => $copy_addresses,
	            'subject'=>$subject,
	            'html'=>$message,
	            'attachment'[1] => '@'. realpath($attachment)
	        );
	    }
	    
	    $headers_arr = array("Content-Type: multipart/form-data");
	    
	    $session = curl_init(MAILGUN_URL.'/messages');
	    curl_setopt($session, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
	    curl_setopt($session, CURLOPT_USERPWD, 'api:' . MAILGUN_KEY);
	    curl_setopt($session, CURLOPT_POST, true);
	    curl_setopt($session, CURLOPT_POSTFIELDS, $array_data);
	    curl_setopt($session, CURLOPT_HEADER, $headers_arr);
	    curl_setopt($session, CURLOPT_ENCODING, 'UTF-8');
	    curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
	    curl_setopt($session, CURLOPT_SSL_VERIFYPEER, false);
	    $response = curl_exec($session);
	    curl_close($session);
	    return $response;
	}

	function sendSMS($mobile, $message)
	{
		$mobile = $this->formatNumber($mobile);
		// Save the sms into the log for the cron job to process
		$sms_log = array("message"=>$message, "recipient"=>$mobile);
		$this->generic->add($sms_log, "sms_log");
	}
	
	function sendActualSMS($mobile, $message)
	{
		$apikey = "";
		$uname = "services@adxcredit.com";
		$mobile = $this->formatNumber($mobile);
		$from = 'ADXCredit';
		$message = urlencode($message);
		$address= "http://api.ebulksms.com:8080/sendsms?username=$uname&apikey=$apikey&sender=$from&messagetext=$message&flash=0&recipients=$mobile";
		
		// Connect to the Web API using cURL.
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $address);
		curl_setopt($ch, CURLOPT_TIMEOUT, '3');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		
		$xmlstr = curl_exec($ch);
		$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		return $xmlstr;
	}
	
	function formatNumber($number)
	{
		if(substr($number,0,1) == '+')
		{
			$number = substr($number, 1);
		}
		else if(substr($number,0,1) == '0')
		{
			$number = '234'.substr($number,1);
		}
		return $number;
	}

	// Send push notification via FCM
	function sendFCM($message, $device_ids, $message_info='', $type ='') 
	{
    	$API_ACCESS_KEY = "";
    	$url = 'https://fcm.googleapis.com/fcm/send';

    	$fields = array (
            'registration_ids' => $device_ids,
            'data' => array ("message" => $message, "message_info" => $message_info),                
            'priority' => 'high',
            'notification' => array('title' => $message['title'], 'body' => $message['body']),
    	);
    	$fields = json_encode($fields);
    	$headers = array ('Authorization: key=' . $API_ACCESS_KEY, 'Content-Type: application/json');
	    $ch = curl_init ();
	    curl_setopt ($ch, CURLOPT_URL, $url);
	    curl_setopt ($ch, CURLOPT_POST, true);
	    curl_setopt ($ch, CURLOPT_HTTPHEADER, $headers);
	    curl_setopt ($ch, CURLOPT_RETURNTRANSFER, true);
	    curl_setopt ($ch, CURLOPT_POSTFIELDS, $fields);
	    $result = curl_exec ($ch);
	    curl_close($ch);
	    return $result;
	}

	public function queuePush($message, $device_ids)
	{
		$device_ids_str = implode(",", $device_ids);
		$this->generic->add(
			array(
				'message_body'=>$message['body'], 
				'message_title'=>$message['title'],
				'device_ids'=>$device_ids_str), "push_logs");
	}
}