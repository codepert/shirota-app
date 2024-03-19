class AddProcessingCntToBill < ActiveRecord::Migration[7.1]
  def change
    add_column :bills, :processing_cnt, :integer, null:false, default: 0
  end
end
