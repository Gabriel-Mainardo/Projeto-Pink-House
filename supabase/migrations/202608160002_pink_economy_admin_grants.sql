begin;

-- RLS remains the authorization boundary. These grants only let authenticated
-- sessions reach the admin policies defined by the foundation migration.
grant insert, update, delete on public.economy_settings to authenticated;
grant insert, update, delete on public.platform_resources to authenticated;
grant insert, update, delete on public.pinkcoin_packages to authenticated;
grant insert, update, delete on public.reward_categories to authenticated;
grant insert, update, delete on public.rewards to authenticated;

commit;
