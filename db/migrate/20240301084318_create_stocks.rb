class CreateStocks < ActiveRecord::Migration[7.1]
  def change
    create_table :stocks do |t|
      t.references :warehouse,     null:false, comment: '倉庫id'
      t.references :shipper,       null:false, comment: '荷主id'
      t.references :product,       null:false, comment: '品名id'
      t.bigint :total_amount,       null:false, comment: '在庫数'
      t.timestamps

    end
  end
end
