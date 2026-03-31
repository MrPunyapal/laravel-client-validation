<?php

declare(strict_types=1);

namespace MrPunyapal\ClientValidation\Console;

use Illuminate\Console\Command;

class InstallCommand extends Command
{
    protected $signature = 'client-validation:install
                            {--force : Overwrite existing files}';

    protected $description = 'Install Laravel Client Validation package';

    public function handle(): int
    {
        $this->info('Installing Laravel Client Validation...');

        $this->call('vendor:publish', [
            '--tag' => 'client-validation-config',
            '--force' => $this->option('force'),
        ]);

        $this->call('vendor:publish', [
            '--tag' => 'client-validation-assets',
            '--force' => $this->option('force'),
        ]);

        $this->info('Laravel Client Validation installed successfully.');

        return self::SUCCESS;
    }
}
