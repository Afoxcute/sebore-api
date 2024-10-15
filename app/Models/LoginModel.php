<?php namespace App\Models;

use CodeIgniter\Model;

class LoginModel extends Model
{	
	function checkLogin($username, $password)
	{
		$builder = $this->db->table('users');
		$builder->select('users.*, companies.account_id');
		$builder->join('companies', 'users.company_id = companies.id', "left");
		$builder->where(['users.username' => $username, 'users.is_deleted'=>0]);
		$query = $builder->get();
		$row = $query->getRowArray();
		if(is_array($row) && !empty($row)){
			if($row['user_status'] == 1){
				if(password_verify($password, $row['password']))
					return ['status'=>'success', 'data'=>$row];
		   		else
					return ['status'=>'failed', 'message'=>'Invalid username/password combination', 'data'=>$row];
			}
			else
				return ['status'=>'failed', 'message'=>'Your account has been deactivated', 'data'=>$row];
		}
		else
			return ['status'=>'failed', 'message'=>'Invalid username/password combination'];
	}

	// Method to get form input and perform validations required
	function getFormInput($request, $utility)
	{
		// Fetch the JSON data from the request
		$_data = $request->getJSON(true);
		// Load the form validation service
		$validation =  \Config\Services::validation();
		// Perform the form validations required
		if ($validation->run($_data, 'login_verification') == FALSE){
			$message = $utility->processValidationErrorMessages($validation->getErrors());
			$response = array("status"=>"failed", 'message'=>$message);
		}
		else{
			$response = array("status"=>"success", 'data'=>$_data);
		}
		// Return the response
		return $response;
	}
}