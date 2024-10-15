<?php namespace Config;

class Validation
{
	//--------------------------------------------------------------------
	// Setup
	//--------------------------------------------------------------------

	/**
	 * Stores the classes that contain the
	 * rules that are available.
	 *
	 * @var array
	 */
	public $ruleSets = [
		\CodeIgniter\Validation\Rules::class,
		\CodeIgniter\Validation\FormatRules::class,
		\CodeIgniter\Validation\FileRules::class,
		\CodeIgniter\Validation\CreditCardRules::class,
	];

	/**
	 * Specifies the views that are used to display the
	 * errors.
	 *
	 * @var array
	 */
	public $templates = [
		'list'   => 'CodeIgniter\Validation\Views\list',
		'single' => 'CodeIgniter\Validation\Views\single',
	];

	//--------------------------------------------------------------------
	// Rules
	//--------------------------------------------------------------------

	// Set the rules for login verification form
	public $login_verification = [
		'username'     => 'required',
		'password'     => 'required',
	];

	// Form validation required for when a new account is being created
	public $new_account = [
		'othernames'	=> 'required',
		'lastname'     	=> 'required',
		'phone_number' 	=> 'required',
		'email'        	=> 'required|valid_email|is_unique[accounts.email]',
	];

	// Form validation required for when a new account is being created - user
	public $new_account_user = [
		'othernames'	=> 'required',
		'lastname'     	=> 'required',
		'username'     	=> 'required|is_unique[users.username]',
        'password'     	=> 'required',
		'repassword'	=> 'required|matches[password]',
		'phone_number' 	=> 'required',
		'email'        	=> 'required|valid_email|is_unique[accounts.email]',
	];

	// Form validation required for when a new company is being created
	public $new_company = [
		'company_description'	=> 'required',
		//'company_address'     	=> 'required',
		'business_category_id'	=> 'required',
        'country_id'			=> 'required',
	];

	// Set the rules for login verification for merchant users
	public $merchant_login_verification = [
		'email'     => 'required|valid_email',
		'password'     => 'required',
	];

	// Set the rules for OTP verification form
	public $otp_verification = [
        'otp'     => 'required',
	];

	// Form validation required for forgot password form
	public $forgot_password_validation = [
		'username'     	=> 'required',
        'email'        	=> 'required|valid_email'
	];
	
	// Form validation required for when a new password is being set
	public $change_password_force = [
        'newpassword'     	=> 'required',
		'repassword'	=> 'required|matches[newpassword]',
    ];
	
	// Form validation required for when a new user is being created
	public $new_user = [
		'othernames'	=> 'required',
		'lastname'     	=> 'required',
		'username'     	=> 'required|is_unique[users.username]',
        'password'     	=> 'required',
		'repassword'	=> 'required|matches[password]',
		'email'        	=> 'required|valid_email|is_unique[users.email]',
		'user_role_id' 	=> 'required'
	];
	
	// Form validation required for when a user is being updated
	public $edit_user = [
		'othernames'     => 'required',
		'lastname'     	=> 'required',
		'user_role_id' 	=> 'required'
	];

	// Form validation required for when a new user is being created
	public $new_user_role = [
		'user_role_name'	=> 'required|is_unique[user_roles.user_role_name]',
		'role_description'	=> 'required',
        'role_type'     	=> 'required'
	];
	
	// Form validation required for when a user is being updated
	public $edit_user_role = [
		'user_role_name'	=> 'required',
		'role_description'	=> 'required',
        'role_type'     	=> 'required'
	];
	
	// Form validations required for a new merchant individual account sign-up
	public $merchant_individual_signup = [
		'full_name'     => 'required',
		//'phone_number' 	=> 'required',
		'email'        	=> 'required|valid_email|is_unique[merchants.email]',
        'password'     	=> 'required|min_length[8]|max_length[20]',
		//'repassword'   	=> 'required_with[password]|matches[password]',
		'country'     	=> 'required',
	];

	// Form validations required for a new merchant business account sign-up
	public $merchant_business_signup = [
		'business_name'	=> 'required',
		'full_name'     => 'required',
		'phone_number' 	=> 'required',
		'business_name' => 'required',
		'email'        	=> 'required|valid_email|is_unique[merchants.email]',
        'password'     	=> 'required|min_length[8]|max_length[20]',
		//'repassword'   	=> 'required_with[password]|matches[password]',
		'position'   	=> 'required',
		'country'     	=> 'required',
	];

	// Form validations required for the merchant business update form
	public $merchant_update_business_data = [
		'trading_name'		    => 'required',
		'business_address'      => 'required',
		'business_description'  => 'required',
		'business_category'     => 'required',
		'support_email'         => 'required|valid_email',
		'chargeback_email'      => 'required|valid_email'
	];

	// Form validations required for the merchant settlment update form
	public $merchant_update_settlement_data = [
		'settlement_type'	=> 'required',
		'account_name'		=> 'required',
		'account_number'	=> 'required',
		'bank_code'     	=> 'required'
	];
}
