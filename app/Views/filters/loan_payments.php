        
        <div class="modal fade" id="advanced-filter-modal" tabindex="-1" role="dialog" aria-labelledby="user-profile-modalTitle" aria-hidden="true">
			<div class="modal-dialog modal-lg" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<h5 class="modal-title" id="exampleModalLongTitle">Advanced Filter Options</h5>
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
						</button>
                    </div>
                    <?=form_open("", array("name"=>"advanced_filter_form", "id"=>"advanced_filter_form"))?>
                        <div class="modal-body">

                            

                            <div class="form-group">
                                <label class="" for="">Gender</label>
								<select class="form-control" id="search_gender" name="search_gender">
                                    <option value="">Please select to filter by gender</option>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="" for="">Loan Tenor</label>
								<select class="form-control" id="search_loan_tenor" name="search_loan_tenor">
                                    <option value="">Please select to filter by tenor</option>
                                    <option value="3">3 Months</option>
                                    <option value="6">6 Months</option>
                                    <option value="9">9 Months</option>
                                    <option value="12">12 Months</option>
                                    <option value="15">15 Months</option>
                                    <option value="18">18 Months</option>
                                    <option value="24">24 Months</option>
                                </select>
                            </div>

                            <div class="form-group">
								<label class="" for="">Date Range</label>
								<input class="form-control date-range-picker" type="text" name="search_createdat" id="search_createdat">
                            </div>
                            
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary btn-outline" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="initFilter()">Filter Data</button>
                        </div>
                    <?=form_close()?>
				</div>
			</div>
        </div>