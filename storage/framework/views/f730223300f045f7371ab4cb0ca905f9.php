<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Kantin Fakultas Teknik</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
        <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/customer.tsx']); ?>
    </head>
    <body class="font-sans antialiased">
        <div id="customer-app"></div>
    </body>
</html>
<?php /**PATH D:\1)Pendidikan\2)Kuliah\3)Semester-3\Pemprograman Web\Project-PrakPemWeb\resources\views/customer.blade.php ENDPATH**/ ?>