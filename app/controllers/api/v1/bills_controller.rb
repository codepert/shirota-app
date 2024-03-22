class Api::V1::BillsController < Api::V1::BaseController
  require 'csv'
  require 'grover'
  require 'nokogiri'
  require 'date'
  
  before_action :authenticate_user!
  set_pagination_callback :bill, [:index]
  
  include PdfRender
  include ActionController::MimeResponds # API モードで respond_to を使うために必要

  def index
    from_date = params[:from_date]
    to_date = params[:to_date]
    warehouse_id = params[:warehouse_id]
    shipper_id = params[:shipper_id]


      search = Bill.ransack(
        shipper_id:     shipper_id,
        warehouse_id:   warehouse_id,
        duration_from:  from_date,
        duration_to:    to_date
      )
    
    @bill = search.result.paginate(pagination_params)

    render json: BillsSerializer.new(@bill)

  end
  def create
    from_date     = params[:from_date]
    to_date       = params[:to_date]
    shipper_id    = params[:shipper_id]
    warehouse_id  = params[:warehouse_id]
    closing_date  = params[:closing_date]
    billed_on = Date.today.strftime("%Y-%m-%d")

    if Bill.where("duration_from='#{from_date}' AND duration_to='#{to_date}'").length > 0
      render :json => {
        status: 'error'
      }
      return;
    end
    prepare_bills = Stock.get_uncalc_bills(from_date, to_date)
    ActiveRecord::Base.transaction do
      prepare_bills.map do |prepare_bill|
      
        if closing_date == 20
          prepare_bill_amounts    = Stock.prepare_bill_amounts_20(from_date, to_date, nil, warehouse_id)
        else
          prepare_bill_amounts    = Stock.prepare_bill_amounts(from_date, to_date, nil, warehouse_id)
        end

        current_bill_amount = prepare_bill['current_bill_amount'] == nil ? 0 : prepare_bill['current_bill_amount']

        
        bill = Bill.create(
          shipper_id:           shipper_id,
          warehouse_id:         warehouse_id,
          last_amount:          prepare_bill['previous_bill_amount'] == nil ? 0 : prepare_bill['previous_bill_amount'],
          deposit_amount:       prepare_bill['deposit_amount'] == nil ? 0 : prepare_bill['deposit_amount'],
          handling_cost:        prepare_bill['handle_cost'] == nil ? 0 : prepare_bill['handle_cost'],
          storage_cost:         prepare_bill['storage_cost'] == nil ? 0 : prepare_bill['storage_cost'],
          current_amount:       prepare_bill['current_bill_amount'] == nil ? 0 : prepare_bill['current_bill_amount'],
          tax:                  (current_bill_amount*0.1),
          duration_from:        from_date,
          duration_to:          to_date,
          billed_on:            billed_on,
          closing_date:         closing_date,
          billed:               1,
          processing_cnt:       prepare_bill_amounts.length
        )

        prepare_bill_amounts.map do |record|
          BillAmount.create(
            bill_id:                      bill['id'] ,
            product_id:                   record.product_id,                    
            lot_number:                   record.lot_number,   
            previous_stock_amount:        record.previous_stock_amount == nil ? 0: record.previous_stock_amount,
            first_half_instock_amount:    record.first_half_instock_amount == nil ? 0: record.first_half_instock_amount,
            first_half_outstock_amount:   record.first_half_outstock_amount == nil ? 0: record.first_half_outstock_amount,            
            mid_instock_amount:           record.mid_instock_amount == nil ? 0: record.mid_instock_amount,          
            mid_outstock_amount:          record.mid_outstock_amount == nil ? 0: record.mid_outstock_amount,                  
            second_half_instock_amount:   record.second_half_instock_amount == nil ? 0: record.second_half_instock_amount,                  
            second_half_outstock_amount:  record.second_half_outstock_amount == nil ? 0: record.second_half_outstock_amount,          
            current_stock_amount:         record.current_stock_amount == nil ? 0 : record.current_stock_amount,     
            total_inout_stock_amount:     record.total_inout_stock_amount == nil ? 0 : record.total_inout_stock_amount,     
            storage_fee_rate:             record.storage_fee_rate == nil ? 0 : record.storage_fee_rate,
            instock_handle_fee_rate:      record.instock_handle_fee_rate == nil ? 0 : record.instock_handle_fee_rate,
            outstock_handle_fee_rate:     record.outstock_handle_fee_rate == nil ? 0 : record.outstock_handle_fee_rate
          )
          stockInout = StockInout.where(stock_id: record.stock_id)

          if stockInout.present?
            stockInout.update(is_billed: 1)
          end
        end
      end
    end
    render :json => {
      status: :accepted
    }
  end
  def last_bill_date
    warehouse_id = params[:warehouse_id]
    shipper_id = params[:shipper_id]
    last_bill = Bill.where(billed: 1, warehouse_id: warehouse_id, shipper_id:shipper_id).desc
    last_bill_date = ""
    if last_bill.present?
      last_bill_date = last_bill[0].created_at
    end
    render :json => {
      date: last_bill_date
    }, status: :ok
  end
  def export_bill_report
    bill_id   = params[:id]
    from_date = params[:from_date]
    to_date   = params[:to_date]
    bill = Bill.with_shipper_by_id(bill_id).first
    manangementInfo = ManagementInfo.all.first

    sum_amount = bill.handling_cost + bill.storage_cost + bill.deposit_amount
    billed_on = bill.billed_on
    billed_on_str = billed_on.to_s[0,4] + "年" + billed_on.to_s[5,2] + "月" + billed_on.to_s[8,2] + "日"
    year_last_two_digits = billed_on.to_s[2, 2]

    # doc = Nokogiri::HTML(html)
    # doc.encoding = 'UTF-8'
    controller = ActionController::Base.new
    controller.instance_variable_set(:@billed_year,  billed_on.to_s[0,4])
    controller.instance_variable_set(:@billed_month, billed_on.to_s[5,2])
    controller.instance_variable_set(:@billed_day,   billed_on.to_s[8,2])
    controller.instance_variable_set(:@billed_year,  billed_on.to_s[0,4])
    controller.instance_variable_set(:@shipper_post_code, bill.shipper_post_code)
    controller.instance_variable_set(:@shipper_name, bill.shipper_name)
    controller.instance_variable_set(:@shipper_main_address, bill.shipper_main_address)
    controller.instance_variable_set(:@from_date, from_date)
    controller.instance_variable_set(:@to_date, to_date)
    controller.instance_variable_set(:@company_post_code, manangementInfo.post_code)
    controller.instance_variable_set(:@company_name, manangementInfo.company_name)
    controller.instance_variable_set(:@address1, manangementInfo.address1)
    controller.instance_variable_set(:@tel_number, manangementInfo.tel_number)
    controller.instance_variable_set(:@fax_number, manangementInfo.fax_number)
    controller.instance_variable_set(:@bank, manangementInfo.bank)
    controller.instance_variable_set(:@bank_number, manangementInfo.bank_number)
    controller.instance_variable_set(:@register_number, manangementInfo.register_number)
    controller.instance_variable_set(:@invoice_number, manangementInfo.invoice_number)
    controller.instance_variable_set(:@last_amount, bill.last_amount)
    controller.instance_variable_set(:@handling_cost, bill.handling_cost)
    controller.instance_variable_set(:@storage_cost, bill.storage_cost)
    controller.instance_variable_set(:@sum_amount, sum_amount)
    controller.instance_variable_set(:@tax, bill.tax)
    controller.instance_variable_set(:@current_amount, bill.current_amount)

    html = controller.render_to_string(template: 'templates/bill_report', layout: nil)
    pdf = Grover.new(html).to_pdf
    send_data(pdf, filename: 'sample.pdf', type: 'application/pdf', disposition: 'inline')
  end
  def export_bill_amount_report
    bill_id   = params[:bill_id]
    from_date = params[:from_date]
    to_date   = params[:to_date]

    bill = Bill.find(bill_id)

    if bill.blank?
      render :json => {
        data: "warning"
      }, status: "error"
      return
    end

    bill_amounts = BillAmount.with_product(bill_id)
    shipper = Shipper.find(bill.shipper_id)
    manangementInfo = ManagementInfo.all.first

    
    
    html = "<html><meta charset=\"UTF-8\"><body><div style=\"width:100%;margin-left:25px\">
            <div style=\"display:flex\">
            <div style=\"width:30%;margin-top:70px;font-size:10px\">
              <p style=\"font-family: 'MizukiMinchoU';font-style: 'italic'\">荷主名: #{shipper.name}</p>
            </div>
            <div style=\"text-align:center;margin-top:10px;margin-bottom:20px;width:30%;maring:20px auto;font-size:10px\">
              <h1 style=\"font-family: 'MizukiMinchoU';font-style: 'italic'\">御 請 求 書</h1>
              <div>
                <p>自 #{from_date}</p>
                <p>至 #{to_date}</p>
              </div>
            </div>
            <div style=\"width:30%;padding-left:10px;font-size:10px;margin-top:80px;\">
              <span style=\"border-bottom:1px solid #4096ff;color:#4096ff;float:right;font-family: 'MizukiMinchoU';font-style: 'italic'\">#{manangementInfo.company_name}</span>
            </div></div>
            <div>
            <div style=\"margin-top:5px;display:flex;width:96%;font-size:8px;color:#4096ff\">
              <div style=\"width:56%;\">
              </div>
              <div style=\"width:21%;\">
                <span style=\"font-family: 'MizukiMinchoU';font-style: 'italic'\">*--------------------荷役料>--------------------*</span>
              </div>
              <div style=\"width:21%;\">
                <span>*--------------------保管料>--------------------*</span>
              </div>
            </div>
            <div style=\"margin-top:0px;display:flex;width:96%;font-size:8px;color:#4096ff;font-family: 'MizukiMinchoU';font-style: 'italic'\">
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">ロット番号	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">品名コード,	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">品名,規格荷姿	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">前期繰起	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">上期入庫<br>上期出庫<br>上期積数	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">中期入庫<br>中期出庫<br>中期積数	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">下期入庫<br> 下期出庫<br>	下期積数	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">当期残高	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">総残高	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">単価	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">金額	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">入庫数<br>出庫数	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">単価<br>単価	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px;font-family: 'MizukiMinchoU'\">入庫料<br>出庫料	</div>
              </div></div>"
              total_first_stock_amount  = 0
              total_mid_stock_amount    = 0
              total_second_stock_amount = 0
              total_stock               = 0
              total_handle_fee          = 0
              total_in_stock_amount     = 0
              total_out_stock_amount    = 0
              total_in_stock_fee        = 0
              total_out_stock_fee       = 0
              bill_amounts.map do |record|
                html  += "<div style=\"margin-top:5px;display:flex;width:96%;font-size:8px\">
              <div style=\"width:7%;font-family: 'MizukiMinchoU';\">
                #{record.product_code}
              </div>
              <div style=\"width:7%;font-family: 'MizukiMinchoU';\">
                #{record.product_name}
              </div>
              <div style=\"width:7%;font-family: 'MizukiMinchoU';\">
                #{record.specification} 
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.previous_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.first_half_instock_amount}</div>
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.first_half_outstock_amount}</div>
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.first_half_instock_amount+record.previous_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.mid_instock_amount}</div>
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.mid_outstock_amount}</div>
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount-record.first_half_outstock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.second_half_instock_amount}</div>
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.second_half_outstock_amount}</div>
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount-record.second_half_outstock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{(record.first_half_instock_amount+record.previous_stock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount-record.first_half_outstock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount)}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.storage_fee_rate}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.storage_fee_rate*((record.first_half_instock_amount+record.previous_stock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount-record.first_half_outstock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount))}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.first_half_instock_amount+record.second_half_instock_amount+record.mid_instock_amount}</div>
                <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{record.first_half_outstock_amount+record.second_half_outstock_amount+record.mid_outstock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">
                  ￥ #{record.instock_handle_fee_rate}
                </div>
                <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">
                  ￥ #{record.outstock_handle_fee_rate}
                </div>
              </div>
              <div style=\"width:7%;\">
                 <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">￥#{(record.first_half_instock_amount+record.second_half_instock_amount+record.mid_instock_amount)*record.instock_handle_fee_rate} </div>
                 <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">￥#{(record.first_half_outstock_amount+record.second_half_outstock_amount+record.mid_outstock_amount)*record.outstock_handle_fee_rate} </div>
              </div>
            </div>"
            
              total_first_stock_amount  += record.first_half_instock_amount+record.previous_stock_amount
              total_mid_stock_amount    += record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount
              total_second_stock_amount += record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount
              total_stock               += (record.first_half_instock_amount+record.previous_stock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount-record.first_half_outstock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount)
              total_handle_fee          += record.storage_fee_rate*((record.first_half_instock_amount+record.previous_stock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount-record.first_half_outstock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount))
              total_in_stock_amount     += record.first_half_instock_amount+record.second_half_instock_amount+record.mid_instock_amount
              total_out_stock_amount    += record.first_half_outstock_amount+record.second_half_outstock_amount+record.mid_outstock_amount
              total_in_stock_fee        += (record.first_half_instock_amount+record.second_half_instock_amount+record.mid_instock_amount)*record.instock_handle_fee_rate
              total_out_stock_fee       += (record.first_half_outstock_amount+record.second_half_outstock_amount+record.mid_outstock_amount)*record.outstock_handle_fee_rate
          end
             html +=  "<div style=\"margin-top:5px;display:flex;width:96%;font-size:8px\">
              <div style=\"width:28%;\">
                <div style=\"float:right;padding-right:35px\">合計</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_first_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_mid_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_second_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                 </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_stock}</div>
              </div>
              <div style=\"width:7%;\">
                  
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_handle_fee}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_in_stock_amount}</div>
                <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_out_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
               
              </div>
              <div style=\"width:7%;\">
                 <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">￥#{total_in_stock_fee} </div>
                 <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">￥#{total_out_stock_fee} </div>
              </div>
            </div><hr>
            <div style=\"margin-top:5px;display:flex;width:96%;font-size:8px\">
              <div style=\"width:28%;float:right\">
                 <div style=\"float:right;padding-right:35px\">頁計</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_first_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_mid_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_second_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                 </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_stock}</div>
              </div>
              <div style=\"width:7%;\">
                  
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_handle_fee}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_in_stock_amount}</div>
                <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">#{total_out_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
               
              </div>
              <div style=\"width:7%;\">
                 <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">￥#{total_in_stock_fee} </div>
                 <div style=\"border:1px solid #bbbaba;margin:2px;font-family: 'Arial Narrow';\">￥#{total_out_stock_fee} </div>
              </div>
            </div>"
            
            html += "</div></div></body></html>";

    filename = "template"
    doc = Nokogiri::HTML(html)
    doc.encoding = 'UTF-8'
    pdf = Grover.new(html, format: 'A4').to_pdf
    send_data pdf, filename: filename, type: "application/pdf"
  end
  def export_bills_report
    id = params[:id]
    bills = Bill.where("bills.id='#{id}'")
                .joins('LEFT JOIN shippers ON shippers.id= bills.shipper_id')
                .select("bills.*, shippers.name as shipper_name, shippers.code as shipper_code")
    total_bills = compute_totals(bills)

    puts "total============"
    # filename = "template"
    # doc = Nokogiri::HTML(html)
    # doc.encoding = 'UTF-8'
    # pdf = Grover.new(html, format: 'A4').to_pdf
    # send_data pdf, filename: filename, type: "application/pdf"

    puts  total_bills[0]['last_amount']
    controller = ActionController::Base.new
    controller.instance_variable_set(:@bills, bills)
    controller.instance_variable_set(:@total_bills, total_bills)

    html = controller.render_to_string(template: 'templates/bills_report', layout: nil)
    pdf = Grover.new(html).to_pdf
    send_data(pdf, filename: 'sample.pdf', type: 'application/pdf', disposition: 'inline')

  end
  def compute_totals(bills)

    types = ['last_amount', 'deposit_amount', 'handling_cost','storage_cost', 'tax','current_amount']

    total = Hash.new(0)
    types.each { |type| total[:"#{type}"] = 0 }

    bills.each do |record|
      types.each do |type|
        total[:"#{type}"] += eval("record.#{type}")
      end
    end
  end
end
