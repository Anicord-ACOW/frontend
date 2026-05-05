<script lang="ts">
  import { getDate } from '../api/date/query.remote';
</script>
<h1>Welcome to SvelteKit</h1>
<p>Server timestamp is {await getDate()}</p>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
