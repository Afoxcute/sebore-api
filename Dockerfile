FROM php:8.2-apache
WORKDIR /var/www/html

#Mod rewrite
RUN a2enmod  rewrite

# Linux Library
RUN apt-get update -y && apt-get install -y \
    libicu-dev \
    libmariadb-dev \
    unzip zip \
    zlib1g-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libzip-dev 

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
#COPY .htaccess /var/www/html/
COPY . /var/www/html/
RUN sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

#COPY index.php /var/www/html/

# PHP Extension
RUN docker-php-ext-install gettext intl mysqli pdo pdo_mysql gd zip

RUN docker-php-ext-configure gd --enable-gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd
