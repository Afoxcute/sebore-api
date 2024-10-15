<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Yaraa.io</title>
</head>

<body style="margin:0px; background: #f8f8f8; ">
    <div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;">
        <div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px">
            <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px">
                <tbody>
                    <tr>
                        <td style="vertical-align: top; padding-bottom:30px;" align="center">
                            <a href="<?=base_url()?>" target="_blank">
                                <img src="<?=base_url()?>/assets/img/logo.png" alt="Yaraa" height="60" style="border:none">
                            </a>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div style="padding: 40px; background: #fff;">
                <table border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
                    <tbody>
                        <tr>
                            <td style="border-bottom:1px solid #f6f6f6;">
                                <h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">
                                    <?php if(isset($lastname)) {?>
                                       Hello <?=ucfirst($lastname)?>,
                                    <?php }else echo "<b>Hello,</b>" ?>
                                </h1>
                                <p style="margin-top:0px; color:#bbbbbb;">Activation Completed.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0 30px 0;">
                                <p>
                                    Your account on Yaraa.io has been successfully activated, to access your account, simply click the button below.
                                </p>
                                <center>
                                    <a href="https://yaraa.io/login" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #4fc3f7; border-radius: 60px; text-decoration:none;">
                                        Go to my account
                                    </a>
                                </center>
                                <p>
                                    Cannot click the button above? copy and paste the activation URL directly into your browser. https://yaraa.io/login
                                </p>
                                <b>- Thanks Yaraa.io Team</b> </td>
                        </tr>
                        <tr>
                            <td style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If the button above does not work, try copying and pasting the URL into your browser. If you continue to have problems, please feel free to contact us at hello@yaraa.io</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px">
                <p> Yaraa.io Team</p>
            </div>
        </div>
    </div>
</body>

</html>