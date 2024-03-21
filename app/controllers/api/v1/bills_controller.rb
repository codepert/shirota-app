class Api::V1::BillsController < Api::V1::BaseController
  before_action :authenticate_user!
  set_pagination_callback :bill, [:index]

  require 'csv'
  require 'grover'
  require 'nokogiri'
  require 'date'

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


    html = "<html><meta charset=\"UTF-8\"><body><div style=\"width:100%;margin-left:25px\">
            <div style=\"display:flex\">
              <div style=\"width:30%;font-size:10px\">
                <p style=\"margin-top:50px\">#{bill.shipper_post_code}</p>
                <p style=\"margin-top:0;margin-bottom:5px\">#{bill.shipper_name}</p>
                <p style=\"margin-top:0;margin-bottom:5px;width:160px;border-bottom:1px solid red\">#{bill.shipper_main_address} 殿</p>
              </div>
              <div style=\"text-align:center;margin-top:10px;margin-bottom:20px;width:30%;maring:20px auto;font-size:10px\">
                <h1>御 請 求 書</h1>
                <p style=\"margin-top:20px;margin-bottom:20px;border-bottom: 1px solid red;width:140px; margin-left:auto;margin-right:auto\">
                発行日 #{billed_on_str}</p>  
                <div >
                  <p>自 #{from_date}</p>
                  <p style=\"border-bottom: 1px solid red;width: 100px;margin:auto\">至 #{to_date} </p>
                </div>
              </div>
              <div style=\"width:30%;padding-left:20px;font-size:10px\">
                <p style=\"margin-top:40px;font-size: 14px\">#{manangementInfo.company_name}</p>
                <p>#{manangementInfo.post_code} #{manangementInfo.address1}</p>
                <p style=\"padding-left: 50px;margin-top:0;margin-bottom:5px\">TEL #{manangementInfo.tel_number}</p>
                <p style=\"padding-left: 50px;margin-top:0;margin-bottom:5px\">FAX #{manangementInfo.fax_number}</p>
                <p style=\"margin-top:0;margin-bottom:5px\"><span>取引銀行</span> #{manangementInfo.bank} </p>
                <p style=\"padding-left: 50px;margin-top:0;margin-bottom:5px\"> #{manangementInfo.bank_number}</p>
                <p styl\"margin-top:0\">登録番号 #{manangementInfo.register_number}</p>
              </div>
            </div>
            <div style=\"float:right;\">
              <div style=\"padding-right:55px;margin-bottom:10px;font-size:10px\">請求書No: #{manangementInfo.invoice_number}</div>
            </div>
            <div style=\"margin-top:5px;display:flex;width:96%;font-size:10px\">
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">前回御請求額	</div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥ #{bill.last_amount}</div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">御入金額	</div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥ #{bill.deposit_amount}</div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">当月荷役料</div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥#{bill.handling_cost}</div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">当月保管料</div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥#{bill.storage_cost}</div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\"></div>
                <div style=\"text-align:center;height:30px;padding-top:10px\"></div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">税抜合計額<br><span>(税率10%対象)</span></div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥#{sum_amount}</div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">消費税額<br><span>(税率10%対象)</span></div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥#{bill.tax}</div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 1px 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">今回御請求額</div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥#{bill.current_amount}</div>
              </div>
            </div>
            <div style=\"float:right;margin-top: 10px;padding-right:55px;font-size:10px\">上記の 通りご請求申し上げます。</div></div></body></html>";

    filename = "template"
    doc = Nokogiri::HTML(html)
    doc.encoding = 'UTF-8'
    pdf = Grover.new(html, format: 'A4').to_pdf
    send_data pdf, filename: filename, type: "application/pdf"

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
              <p>荷主名: #{shipper.name}</p>
            </div>
            <div style=\"text-align:center;margin-top:10px;margin-bottom:20px;width:30%;maring:20px auto;font-size:10px\">
              <h1>御 請 求 書</h1>
              <div>
                <p>自 #{from_date}</p>
                <p>至 #{to_date}</p>
              </div>
            </div>
            <div style=\"width:30%;padding-left:10px;font-size:10px;margin-top:80px;\">
              <span style=\"border-bottom:1px solid #4096ff;color:#4096ff;float:right\">#{manangementInfo.company_name}</span>
            </div></div>
            <div>
            <div style=\"margin-top:5px;display:flex;width:96%;font-size:8px;color:#4096ff\">
              <div style=\"width:56%;\">
              </div>
              <div style=\"width:21%;\">
                <span>*--------------------荷役料>--------------------*</span>
              </div>
              <div style=\"width:21%;\">
                <span>*--------------------保管料>--------------------*</span>
              </div>
            </div>
            <div style=\"margin-top:0px;display:flex;width:96%;font-size:8px;color:#4096ff\">
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">ロット番号	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">品名コード,	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">品名,規格荷姿	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">前期繰起	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">上期入庫<br>上期出庫<br>上期積数	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">中期入庫<br>中期出庫<br>中期積数	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">下期入庫<br> 下期出庫<br>	下期積数	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">当期残高	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">総残高	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">単価	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">金額	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">入庫数<br>出庫数	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">単価<br>単価	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid #4096ff;height:40px;text-align:center;padding-top:20px\">入庫料<br>出庫料	</div>
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
              <div style=\"width:7%;\">
                #{record.product_code}
              </div>
              <div style=\"width:7%;\">
                #{record.product_name}
              </div>
              <div style=\"width:7%;\">
                #{record.specification} 
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.previous_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.first_half_instock_amount}</div>
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.first_half_outstock_amount}</div>
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.first_half_instock_amount+record.previous_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.mid_instock_amount}</div>
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.mid_outstock_amount}</div>
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount-record.first_half_outstock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.second_half_instock_amount}</div>
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.second_half_outstock_amount}</div>
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount-record.second_half_outstock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{(record.first_half_instock_amount+record.previous_stock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount-record.first_half_outstock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount)}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.storage_fee_rate}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.storage_fee_rate*((record.first_half_instock_amount+record.previous_stock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount-record.first_half_outstock_amount)+(record.previous_stock_amount+record.first_half_instock_amount+record.mid_instock_amount+record.second_half_instock_amount-record.first_half_outstock_amount-record.mid_outstock_amount))}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.first_half_instock_amount+record.second_half_instock_amount+record.mid_instock_amount}</div>
                <div style=\"border:1px solid #bbbaba;margin:2px\">#{record.first_half_outstock_amount+record.second_half_outstock_amount+record.mid_outstock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px\">
                  ￥ #{record.instock_handle_fee_rate}
                </div>
                <div style=\"border:1px solid #bbbaba;margin:2px\">
                  ￥ #{record.outstock_handle_fee_rate}
                </div>
              </div>
              <div style=\"width:7%;\">
                 <div style=\"border:1px solid #bbbaba;margin:2px\">￥#{(record.first_half_instock_amount+record.second_half_instock_amount+record.mid_instock_amount)*record.instock_handle_fee_rate} </div>
                 <div style=\"border:1px solid #bbbaba;margin:2px\">￥#{(record.first_half_outstock_amount+record.second_half_outstock_amount+record.mid_outstock_amount)*record.outstock_handle_fee_rate} </div>
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
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_first_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_mid_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_second_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                 </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_stock}</div>
              </div>
              <div style=\"width:7%;\">
                  
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_handle_fee}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_in_stock_amount}</div>
                <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_out_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
               
              </div>
              <div style=\"width:7%;\">
                 <div style=\"border:1px solid #bbbaba;margin:2px\">￥#{total_in_stock_fee} </div>
                 <div style=\"border:1px solid #bbbaba;margin:2px\">￥#{total_out_stock_fee} </div>
              </div>
            </div><hr>
            <div style=\"margin-top:5px;display:flex;width:96%;font-size:8px\">
              <div style=\"width:28%;float:right\">
                 <div style=\"float:right;padding-right:35px\">頁計</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_first_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_mid_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_second_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                 </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_stock}</div>
              </div>
              <div style=\"width:7%;\">
                  
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_handle_fee}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_in_stock_amount}</div>
                <div style=\"border:1px solid #bbbaba;margin:2px\">#{total_out_stock_amount}</div>
              </div>
              <div style=\"width:7%;\">
               
              </div>
              <div style=\"width:7%;\">
                 <div style=\"border:1px solid #bbbaba;margin:2px\">￥#{total_in_stock_fee} </div>
                 <div style=\"border:1px solid #bbbaba;margin:2px\">￥#{total_out_stock_fee} </div>
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
    from_date = params[:from_date]
    to_date   = params[:to_date]
    bills = Bill.where("duration_from='#{from_date}' AND duration_to='#{to_date}'")
                .joins('LEFT JOIN shippers ON shippers.id= bills.shipper_id')
                .select("bills.*, shippers.name as shipper_name, shippers.code as shipper_code")
    html = "<html><meta charset=\"UTF-8\">
              <body>
              <div style=\"width:96%;margin-left:2%;margin-right:2%\">
                <div style=\"width:30%;font-size:10px\">
                  <p style=\"margin-top:50px;font-size:16px;font-style:italic\">請求一覧</p>
                </div>
                <div style=\"display:flex;font-size:10px;color:#4096ff;border-bottom:1px solid #4096ff\">
                  <div style=\"width: 8%;padding:1px\">請求書番号</div>
                  <div style=\"width: 8%;padding:1px\">荷主コード</div>
                  <div style=\"width: 20%;padding:1px\">荷主名</div>
                  <div style=\"width: 8%;padding:1px\">前回請求額</div>
                  <div style=\"width: 6%;padding:1px\">入金額</div>
                  <div style=\"width: 6%;padding:1px\">荷役料</div>
                  <div style=\"width: 6%;padding:1px\">保管料</div>
                  <div style=\"width: 6%;padding:1px\">値引</div>
                  <div style=\"width: 8%;padding:1px\">税抜き合計</div>
                  <div style=\"width: 6%;padding:1px\">消費額</div>
                  <div style=\"width: 7%;padding:1px\">今回請求額</div>
                </div>"

                total_last_amount = 0
                total_deposit_amount = 0
                total_handling_cost = 0
                total_storage_cost = 0
                total_ss = 0
                total_s1 = 0
                total_t = 0
                total_tax = 0
                total_current_amount = 0

        bills.map do |record|
              html += "<div style=\"display:flex;width:96%;font-size:10px;margin-top:2px\">
                <div style=\"width: 8%;text-align:right\">#{record.id}</div>
                <div style=\"width: 8%;text-align:right\">#{record.shipper_code}</div>
                <div style=\"width: 20%;text-align:left;margin-left:4px\">#{record.shipper_name}</div>
                <div style=\"width: 8%;text-align:right\">￥ #{record.last_amount}</div>
                <div style=\"width: 8%;text-align:right\">￥ #{record.deposit_amount}</div>
                <div style=\"width: 8%;text-align:right\">￥ #{record.handling_cost}</div>
                <div style=\"width: 8%;text-align:right\">￥ #{record.storage_cost}</div>
                <div style=\"width: 8%;text-align:right\"></div>
                <div style=\"width: 8%;text-align:right\">￥ #{record.handling_cost+record.storage_cost}</div>
                <div style=\"width: 8%;text-align:right\">￥ #{(record.handling_cost+record.storage_cost)*0.1}</div>
                <div style=\"width: 8%;text-align:right\">￥ #{record.current_amount}</div>
              </div>
            </div>"

            total_last_amount += record.last_amount
            total_deposit_amount  += record.last_amount
            total_handling_cost   += record.deposit_amount
            total_storage_cost    += record.handling_cost
            total_ss              += record.storage_cost
            # total_s1              +=　0
            total_t               += record.handling_cost+record.storage_cost
            total_tax             += (record.handling_cost+record.storage_cost)*0.1
            total_current_amount  += record.current_amount
        end
        html += "<hr>"
        html += "<div style=\"display:flex;width:96%;font-size:10px;margin-top:2px\">
                <div style=\"width: 16%;text-align:right\">合計</div>
                <div style=\"width: 20%;text-align:left;margin-left:4px\"></div>
                <div style=\"width: 8%;text-align:right\">￥ #{total_last_amount}</div>
                <div style=\"width: 8%;text-align:right\">￥ #{total_deposit_amount}</div>
                <div style=\"width: 8%;text-align:right\">￥ #{total_handling_cost}</div>
                <div style=\"width: 8%;text-align:right\">￥ #{total_storage_cost}</div>
                <div style=\"width: 8%;text-align:right\">￥ 0</div>
                <div style=\"width: 8%;text-align:right\">￥ #{total_t}</div>
                <div style=\"width: 8%;text-align:right\">￥ #{total_tax}</div>
                <div style=\"width: 8%;text-align:right\">￥ #{total_current_amount}</div>
              </div>
            </div>"
        html += "
          </body>
        </html>"

    filename = "template"
    doc = Nokogiri::HTML(html)
    doc.encoding = 'UTF-8'
    pdf = Grover.new(html, format: 'A4').to_pdf
    send_data pdf, filename: filename, type: "application/pdf"

  end
end
