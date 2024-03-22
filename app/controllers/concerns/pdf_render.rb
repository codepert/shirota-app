module PdfRender
  extend ActiveSupport::Concern
  def render_pdf(html, filename)
     pdf = Grover.new(html, format: 'A4').to_pdf
    send_data pdf, filename: filename, type: "application/pdf"
  end
end