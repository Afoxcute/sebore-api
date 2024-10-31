# Base image
FROM php:7.2-apache

# Install necessary PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache mod_rewrite for .htaccess support
RUN a2enmod rewrite

# Set the working directory
WORKDIR /var/www/html

# Copy your CodeIgniter project files to the container
COPY ./ /var/www/html/


COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
#COPY .htaccess /var/www/html/
COPY . /var/www/html/
RUN sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf


ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Set the appropriate permissions for the CodeIgniter project
RUN chown -R www-data:www-data /var/www/html
RUN chmod -R 755 /var/www/html

# Enable .htaccess by updating the default Apache config
RUN sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Expose port 80
EXPOSE 80

# Start Apache server
CMD ["apache2-foreground"]
