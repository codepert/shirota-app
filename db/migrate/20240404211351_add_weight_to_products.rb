class AddWeightToProducts < ActiveRecord::Migration[7.1]
  def change
    add_column :products, :weight, :integer, null:false, default: 0
  end
end
