<?php

it('runs the install command successfully', function () {
    $this->artisan('client-validation:install')
        ->assertSuccessful();
});

it('runs the install command with force flag', function () {
    $this->artisan('client-validation:install --force')
        ->assertSuccessful();
});
