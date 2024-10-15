<div class="app-drawer-wrapper" id="search_drawer">
    <div class="drawer-nav-btn">
        <button type="button" class="hamburger hamburger--elastic is-active">
            <span class="hamburger-box"><span class="hamburger-inner"></span></span></button>
    </div>
    <div class="drawer-content-wrapper">
        <div class="scrollbar-container">
            <h3 class="drawer-heading">Advanced Filter Options</h3>
            <div class="drawer-section">
                
                <div class="row">

                    <div class="card-body">

                        <?=form_open('', array('id'=>'advanced_filter_form', 'name'=>'advanced_filter_form'))?>
                            <div class="form-group">
                                <label class="" for="">Customer</label>
                                <select class="form-control" id="search_customer_id" name="search_customer_id" style="width: 100%;">
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="" for="">Marital Status</label>
                                <select class="form-control" id="search_marital_status" name="search_marital_status" data-rule-required="true">
                                    <option value="">Select to filter by marital status</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Married">Married</option>
                                    <option value="Single">Single</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </div><!-- /.form-group -->

                            <div class="form-group">
                                <label class="" for="">Gender</label>
                                <select class="form-control" id="search_gender" name="search_gender" data-rule-required="true">
                                    <option value="">Select to filter by gender</option>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                </select>
                            </div><!-- /.form-group -->

                            <div class="form-row form-group">
                                
                                <div class="col-6">
                                    <label class="" for="">From</label>
                                    <input class="form-control date-picker-input-alt" type="text" name="search_createdat_from" id="search_createdat_from" placeholder="Select a date from">
                                </div>
                                <div class="col-6">
                                    <label class="" for="">To</label>
                                    <input class="form-control date-picker-input-alt" type="text" name="search_createdat_to" id="search_createdat_to" placeholder="Select a date to">
                                </div>

                            </div><!-- /.form-group -->


                            <div class="form-group">
                                <label class="" for="">Customer Status</label>
                                <select class="form-control" id="search_marital_status" name="search_marital_status" data-rule-required="true">
                                    <option value="">Select to filter by marital status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Deactivated</option>
                                    <option value="pending">Pending Approval</option>
                                </select>
                            </div><!-- /.form-group -->

                            <div class="form-group">
                                <label class="" for="">Region</label>
                                <select class="form-control" id="search_region_id" name="search_region_id" data-rule-required="true">
                                    <option value="">Select to filter by region</option>
                                    <?php 
                                        if(isset($regions) && count($regions)>0){
                                            foreach($regions as $_d){
                                    ?>
                                    <option value="<?=$_d['id']?>"><?=$_d['region_name']?></option>
                                    <?php
                                        }
                                    }
                                    ?>
                                </select>
                            </div><!-- /.form-group -->

                            <div class="form-group">
                                <label class="" for="">State</label>
                                <select class="form-control" id="search_state_id" name="search_state_id" data-rule-required="true">
                                    <option value="">Select to filter by state</option>
                                    <?php 
                                        if(isset($regions) && count($regions)>0){
                                            foreach($regions as $_d){
                                    ?>
                                    <option value="<?=$_d['id']?>"><?=$_d['region_name']?></option>
                                    <?php
                                        }
                                    }
                                    ?>
                                </select>
                            </div><!-- /.form-group -->

                            <div class="form-group">
                                <label class="" for="">Branch</label>
                                <select class="form-control" id="search_branch_id" name="search_branch_id" data-rule-required="true">
                                    <option value="">Select to filter by branch</option>
                                    <?php 
                                        if(isset($branches) && count($branches)>0){
                                            foreach($branches as $_d){
                                    ?>
                                    <option value="<?=$_d['id']?>"><?=$_d['branch_description']?></option>
                                    <?php
                                        }
                                    }
                                    ?>
                                </select>
                            </div><!-- /.form-group -->

                            <div class="divider"></div>

                            <div class="form-row form-group">
                                
                                <div class="col-6">
                                    <button type="button" class="mb-2 mr-2 btn btn-secondary btn-lg btn-block" onclick="resetFilters()">Reset</button>
                                    <!--<input type="reset" class="mb-2 mr-2 btn btn-secondary btn-lg btn-block" value="Reset">-->
                                </div>
                                <div class="col-6">
                                    <button type="button" class="mb-2 mr-2 btn btn-primary btn-lg btn-block" onclick="init()">Filter</button>
                                </div>

                            </div><!-- /.form-group -->

                        <?=form_close()?>

                    </div><!-- /.card-body -->

                </div><!-- /.row -->


            </div>

            
        </div>
    </div>
</div>
<div class="app-drawer-overlay d-none animated fadeIn"></div>