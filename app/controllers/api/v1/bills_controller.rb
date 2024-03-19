class Api::V1::BillsController < Api::V1::BaseController
  before_action :authenticate_user!
  set_pagination_callback :bill, [:index]

  require 'csv'
  require 'grover'
  require 'nokogiri'

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
    billed_on     = params[:billed_on]
    y             = params[:y]
    m             = params[:m]
    d             = params[:d]

    puts "===========closing_date=========="
    puts closing_date

    prepare_bill = Stock.get_uncalc_bills(from_date, to_date, shipper_id, warehouse_id)
    ActiveRecord::Base.transaction do
      
      if closing_date == '20'
        prepare_bill_amounts    = Stock.prepare_bill_amounts_20(from_date, to_date, shipper_id, warehouse_id)
      else
        prepare_bill_amounts    = Stock.prepare_bill_amounts(from_date, to_date, shipper_id, warehouse_id)
      end

      current_bill_amount = prepare_bill.first.current_bill_amount == nil ? 0 : prepare_bill.first.current_bill_amount
        bill = Bill.create(
          shipper_id: shipper_id,
          warehouse_id: warehouse_id,
          last_amount: prepare_bill.first.previous_bill_amount == nil ? 0 : prepare_bill.first.previous_bill_amount,
          deposit_amount: prepare_bill.first.received_payment_amount == nil ? 0 : prepare_bill.first.received_payment_amount,
          handling_cost: prepare_bill.first.handle_cost == nil ? 0 : prepare_bill.first.handle_cost,
          storage_cost: prepare_bill.first.storage_cost == nil ? 0 : prepare_bill.first.storage_cost,
          current_amount: prepare_bill.first.current_bill_amount == nil ? 0 : prepare_bill.first.current_bill_amount,
          tax: (current_bill_amount*0.1),
          duration_from: from_date,
          duration_to: to_date,
          billed_on: billed_on,
          closing_date: closing_date,
          billed: 1,
          processing_cnt: prepare_bill_amounts.length
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
    render :json => {
      status: :accepted
    }
  end
  def export_bill_report
    shipper_id              = params[:shipper_id]
    bill_payment_amount     = params[:bill_payment_amount]
    handling_cost           = params[:handling_cost]
    last_bill_amount        = params[:last_bill_amount]
    product_name            = params[:product_name]
    received_payment_amount = params[:received_payment_amount]
    tax                     = params[:tax]
    total_storage_fee       = params[:total_storage_fee]
    
    shipper = Shipper.find(shipper_id)


    html = "<html><meta charset=\"UTF-8\"><body><div style=\"width:100%;margin-left:25px\">
            <div style=\"display:flex\">
            <div style=\"width:30%\">
              <p></p>
              <p></p>
              <p></p>
            </div>
            <div style=\"text-align:center;margin-top:10px;margin-bottom:20px;width:30%;maring:20px auto;font-size:12px\">
              <h1>御 請 求 書</h1>
              <p style=\"margin-top:20px;margin-bottom:20px;border-bottom: 2px solid blue;width:180px; margin-left:auto;margin-right:auto\">発行日 2024 年 10 月 30 日</p>  
              <div>
                <p>自 23 年 10 月 01 日</p>
                <p>自 23 年 10 月 31 日</p>
              </div>
            </div>
            <div style=\"width:30%;padding-left:20px;font-size:12px\">
              <p style=\"margin-top:80px;\">#{shipper.name}</p>
              <p>#{shipper.main_address}</p>
              <p> 登録番号: #{shipper.code}</p>
            </div></div>
            <div>
            <div style=\"float:right;\">
              <div style=\"padding-right:55px;margin-bottom:10px;font-size:12px\">請求書No: 006855</div>
            </div>
            <div style=\"margin-top:5px;display:flex;width:96%;font-size:12px\">
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">前回御請求額	</div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥ #{last_bill_amount}</div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">御入金額	</div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥ #{received_payment_amount}</div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">当月荷役料</div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥#{handling_cost}</div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">当月保管料</div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥#{total_storage_fee}</div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\"></div>
                <div style=\"text-align:center;height:30px;padding-top:10px\"></div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">税抜合計額<br><span>(税率10%対象)</span></div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥#{last_bill_amount}</div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 0 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">消費税額<br><span>(税率10%対象)</span></div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥#{last_bill_amount}</div>
              </div>
              <div style=\"width:12%;border-style:solid;border-color: red;border-width:1px 1px 1px 1px\">
                <div style=\"border-bottom:1px solid red;height:40px;text-align:center;padding-top:20px\">今回御請求額</div>
                <div style=\"text-align:center;height:30px;padding-top:10px\">￥#{last_bill_amount}</div>
              </div>
            </div></div></body></html>";

    filename = "template"
    doc = Nokogiri::HTML(html)
    doc.encoding = 'UTF-8'
    pdf = Grover.new(html, format: 'A4').to_pdf
    send_data pdf, filename: filename, type: "application/pdf"

  end
  def export_bill_amount_report
    billed_on              = params[:bill_date]
    bill = Bill.find_by(billed_on: billed_on)

    if bill.blank?
      render :json => {
        data: "warning"
      }, status: "error"
      return
    end

    bill_amounts = BillAmount.with_product(bill.id)
    shipper = Shipper.find(bill.shipper_id)
    html = "<html><meta charset=\"UTF-8\"><body><div style=\"width:100%;margin-left:25px\">
            <div style=\"display:flex\">
            <div style=\"width:30%\">
              <p></p>
              <p></p>
              <p></p>
            </div>
            <div style=\"text-align:center;margin-top:10px;margin-bottom:20px;width:30%;maring:20px auto;font-size:12px\">
              <h1>御 請 求 書</h1>
              <p style=\"margin-top:20px;margin-bottom:5px;border-bottom: 2px solid red;width:180px; margin-left:auto;margin-right:auto\">
              発行日 2024 年 10 月 30 日
              </p>  
              <div>
                <p>自 23 年 10 月 01 日</p>
                <p>自 23 年 10 月 31 日</p>
              </div>
            </div>
            <div style=\"width:30%;padding-left:10px;font-size:12px\">
              <p style=\"margin-top:80px;\">#{shipper.name}</p>
            </div></div>
            <div>
            <div style=\"float:right;\">
              <div style=\"padding-right:55px;margin-bottom:10px;font-size:8px\">請求書No: 006855</div>
            </div>
            <div style=\"margin-top:5px;display:flex;width:96%;font-size:8px\">
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">ロット番号	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">品名コード,	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">品名,規格荷姿	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">前期繰起	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">上期入庫<br>上期出庫<br>上期積数	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">中期入庫<br>中期出庫<br>中期積数	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">下期入庫<br> 下期出庫<br>	下期積数	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">当期残高	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">総残高	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">単価	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">金額	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">入庫数<br>出庫数	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">単価<br>単価	</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border-bottom:1px solid blue;height:40px;text-align:center;padding-top:20px\">入庫料<br>出庫料	</div>
              </div></div>"
              
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
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #eee\">#{record.first_half_instock_amount}</div>
                  <div style=\"border:1px solid #eee\">#{record.first_half_outstock_amount}</div>
                  <div style=\"border:1px solid #eee\">#{record.first_half_instock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #eee\">#{record.mid_instock_amount}</div>
                  <div style=\"border:1px solid #eee\">#{record.mid_outstock_amount}</div>
                  <div style=\"border:1px solid #eee\">#{record.mid_instock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #eee\">#{record.second_half_instock_amount}</div>
                  <div style=\"border:1px solid #eee\">#{record.second_half_outstock_amount}</div>
                  <div style=\"border:1px solid #eee\">#{record.second_half_instock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #eee\">#{record.second_half_instock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                  <div style=\"border:1px solid #eee\">#{record.second_half_instock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #eee\">#{record.storage_fee_rate}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #eee\">#{record.storage_fee_rate*record.second_half_instock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #eee\">#{record.first_half_instock_amount+record.second_half_instock_amount+record.mid_instock_amount}</div>
                <div style=\"border:1px solid #eee\">#{record.first_half_outstock_amount+record.second_half_outstock_amount+record.mid_outstock_amount}</div>
              </div>
              <div style=\"width:7%;\">
                <div style=\"border:1px solid #eee\">
                  #{record.first_half_instock_amount+record.second_half_instock_amount+record.mid_instock_amount}
                </div>
                <div style=\"border:1px solid #eee\">
                  #{record.first_half_outstock_amount+record.second_half_outstock_amount+record.mid_outstock_amount})
                </div>
              </div>
              <div style=\"width:7%;\">
                 <div style=\"border:1px solid #eee\">￥0 </div>
                 <div style=\"border:1px solid #eee\">￥0 </div>
              </div>
            </div>"
          end
              
            html += "</div></div></body></html>";

            puts html

    filename = "template"
    doc = Nokogiri::HTML(html)
    doc.encoding = 'UTF-8'
    pdf = Grover.new(html, format: 'A4').to_pdf
    send_data pdf, filename: filename, type: "application/pdf"
  end
end
