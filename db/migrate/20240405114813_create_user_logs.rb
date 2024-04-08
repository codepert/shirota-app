class CreateUserLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :user_logs do |t|
      t.string :login_id,       null:false
      t.string :access_origin,  null:false
      t.string :status,         null:false
      t.timestamps
    end
  end
end
