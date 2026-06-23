<script lang="ts">
	import { app } from '$lib/config';

	interface User {
		id: string;
		username: string;
		avatarUrl: string;
	}

	let { user = null }: { user: User | null } = $props();
</script>

<nav class="px-6 py-3 border-base-300 flex w-full items-center justify-between border-b bg-base-100/80 backdrop-blur-md sticky top-0 z-50">
	<!-- Brand -->
	<a href="/" class="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
		<img src="/Anicord_Logo.png" alt="Anicord Logo" class="h-7 w-7 object-contain" />
		<span class="text-lg font-bold tracking-tight">{app.name}</span>
	</a>

	<!-- Right side -->
	<div class="flex items-center gap-3">
		{#if user}
			<!-- User dropdown -->
			<div class="dropdown relative">
				<button
					id="navbar-user-dropdown"
					type="button"
					class="dropdown-toggle flex items-center gap-2.5 rounded-xl px-3 py-1.5 hover:bg-base-200 transition-colors duration-200 cursor-pointer"
					aria-haspopup="menu"
					aria-expanded="false"
					aria-label="User menu"
				>
					<img
						src={user.avatarUrl}
						alt={user.username}
						class="h-8 w-8 rounded-full object-cover ring-2 ring-primary/30"
					/>
					<span class="text-sm font-medium">{user.username}</span>
					<span class="icon-[tabler--chevron-down] text-base opacity-60"></span>
				</button>

				<ul
					class="dropdown-menu dropdown-open:opacity-100 hidden min-w-44"
					role="menu"
					aria-orientation="vertical"
					aria-labelledby="navbar-user-dropdown"
				>
					<li role="menuitem">
						<a href="/dashboard" class="dropdown-item gap-2.5">
							<span class="icon-[tabler--layout-dashboard] text-lg opacity-70"></span>
							Dashboard
						</a>
					</li>
					<li role="menuitem">
						<a href="/settings" class="dropdown-item gap-2.5">
							<span class="icon-[tabler--settings] text-lg opacity-70"></span>
							Settings
						</a>
					</li>
					<li role="menuitem">
						<a href="/support" class="dropdown-item gap-2.5">
							<span class="icon-[tabler--help-circle] text-lg opacity-70"></span>
							Support
						</a>
					</li>
					<li class="divider" role="separator"></li>
					<li role="menuitem">
						<a href="/logout" class="dropdown-item gap-2.5 text-error w-full">
							<span class="icon-[tabler--logout] text-lg"></span>
							Log out
						</a>
					</li>
				</ul>
			</div>
		{:else}
			<!-- Login button -->
			<a href="/login" class="btn btn-primary btn-sm gap-2">
				<span class="icon-[tabler--brand-discord-filled] text-base"></span>
				Login
			</a>
		{/if}
	</div>
</nav>
