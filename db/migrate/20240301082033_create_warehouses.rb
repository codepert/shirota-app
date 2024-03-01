class CreateWarehouses < ActiveRecord::Migration[7.1]
  def change
    create_table :warehouses do |t|
      t.string :name

      t.timestamps
    end
  add_index :warehouses, :name,                unique: true
  end
end
