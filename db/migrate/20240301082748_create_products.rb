class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :products do |t|
      t.string :name,                   null: false, comment: '品名'
      t.string :code,                   null: false, comment: '品名コード'
      t.references :warehouse_fee, null: false, comment: '単価 id', type: :bigint
      t.string :specification,          null: false, comment: '規格・荷姿'
      t.timestamps
    end
    add_index :products, :code,                         unique: true
    add_index :products, :name,                         unique: true
    add_index :products, :specification,                unique: true
  end
end
