class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self, :authentication_keys => [:login_id]

  belongs_to :user_authority
  belongs_to :responsible_category

  # scope :user_page_permission, ->(user_id) {
  #   joins(user_authority: { authority_page: :page })
  #   .where(users: { id: user_id })
  #   .select('authority_pages.page_id, 
  #             authority_pages.is_edit, 
  #             authority_pages.is_read, 
  #             pages.path')
  # }

  # scope :with_authority_info, -> {
  #   select('users.id, users.name, users.login_id, users.email, users.user_authority_id, user_authorities.name as authority_name')
  #     .joins('LEFT JOIN user_authorities ON users.user_authority_id = user_authorities.id')
  # }

   validates :login_id, presence: true, uniqueness: true
   validates :login_id, uniqueness: true

  # Override the default Devise email authentication methods
  def email_required?
    false
  end

  def email_changed?
    false
  end


end
