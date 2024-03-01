module Paginatable
  extend ActiveSupport::Concern

  included do
    scope :paginate, ->(params = { page: nil, limit: nil }) do
      page = params[:page] || 1
      limit = params[:limit] || 20
      page(page).per(limit)
    end
  end
end

# module Paginatable
#   extend ActiveSupport::Concern

#   class_methods do
#     def paginate(params = { page: nil, limit: nil })
#       page = params[:page] || 1
#       limit = params[:limit] || 20
#       page(page).per(limit)
#     end
#   end
# end