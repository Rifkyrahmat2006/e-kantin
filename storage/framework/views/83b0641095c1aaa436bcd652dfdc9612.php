/**<?php echo when(!str_contains($controller, '\\Closure'), PHP_EOL . " * @see {$controller}::" . ($isInvokable ? '__invoke' : $docblock_method ?? $method)); ?>

 * @see <?php echo $path; ?>:<?php echo $line; ?>

<?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php $__currentLoopData = $parameters; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $parameter): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
<?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if BLOCK]><![endif]--><?php endif; ?><?php if($parameter->default !== null): ?>
 * @param <?php echo $parameter->name; ?> - Default: <?php echo \Illuminate\Support\Js::from($parameter->default)->toHtml() ?>

<?php endif; ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?><?php if(\Livewire\Mechanisms\ExtendBlade\ExtendBlade::isRenderingLivewireComponent()): ?><!--[if ENDBLOCK]><![endif]--><?php endif; ?>
 * @route <?php echo $uri; ?>

 */
<?php /**PATH D:\1)Pendidikan\2)Kuliah\3)Semester-3\Pemprograman Web\Project-PrakPemWeb\vendor\laravel\wayfinder\src/../resources/docblock.blade.ts ENDPATH**/ ?>