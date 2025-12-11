<?php

namespace App\Filament\Resources\TenantSettlementResource\Pages;

use App\Filament\Resources\TenantSettlementResource;
use Filament\Resources\Pages\ListRecords;

class ListTenantSettlements extends ListRecords
{
    protected static string $resource = TenantSettlementResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
