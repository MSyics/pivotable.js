# pivotable.js

## Usage

[CodePen](https://codepen.io/MSyics/pen/XWqvpwO)

```html
<div class="pivotable">
    <div class="pivotable-item">
        <h2 class="pivotable-header">ITEM1</h2>
        <div>...</div>
    </div>
    <div class="pivotable-item">
        <h2 class="pivotable-header">ITEM2</h2>
        <div>...</div>
    </div>
    <div class="pivotable-item">
        <h2 class="pivotable-header">ITEM3</h2>
        <div>...</div>
    </div>
</div>

<script type="module">
    import { pivotable } from "./pivotable.js";
    pivotable();
</script>
```

for Blazor WebAssembly
```csharp
protected override async Task OnAfterRenderAsync(bool firstRender)
{
    await base.OnAfterRenderAsync(firstRender);

    if (firstRender)
    {
        var module = await JSRuntime.InvokeAsync<IJSObjectReference>("import", "./js/pivotable.js");
        await module.InvokeVoidAsync("pivotable");
    }
}
```
