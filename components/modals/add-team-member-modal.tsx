"use client";

import { AuthFormField } from "@/components/auth/auth-form-field";
import { FormFilterDropdownField } from "@/components/form/form-filter-dropdown-field";
import { FormTextareaField } from "@/components/form/form-textarea-field";
import { ModalCloseIcon } from "@/components/vector";
import { useAdminInviteTeamMember, useAdminTeamPermissions } from "@/lib/team/hooks/use-admin-team-member";
import { ADMIN_INVITE_EMAIL_PLACEHOLDER, ADMIN_INVITE_MESSAGE_PLACEHOLDER } from "@/lib/team/constants/admin-invite.constant";
import { adminInviteTeamMemberSchema, type AdminInviteTeamMemberFormValues } from "@/lib/team/schemas/admin-invite.schema";
import {
    buildAdminPermissionCatalog,
    formatAdminPermissionLabel,
    sortAdminPermissionCatalog,
} from "@/lib/team/utilities/admin-permission-catalog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useMemo } from "react";

interface AddTeamMemberModalProps {
    /** Closes the modal after cancel or successful invite. */
    onClose: () => void;
    /** When false, required-field asterisks are hidden. Default: true. */
    showRequiredIndicator?: boolean;
}

export function AddTeamMemberModal({ onClose, showRequiredIndicator = true }: AddTeamMemberModalProps) {
    const inviteTeamMemberMutation = useAdminInviteTeamMember({
        onSuccess: onClose,
    });
    const { data: adminTeamPermissions, isLoading: isLoadingAdminTeamPermissions } = useAdminTeamPermissions();

    const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<AdminInviteTeamMemberFormValues>({
        resolver: zodResolver(adminInviteTeamMemberSchema),
        mode: "onSubmit",
        defaultValues: {
            permissions: []
        }
    });

    const selectedRoleId = watch("roleId");
    const formCustomPermissions = watch("permissions") || [];

    const adminTeamRolesOptions = useMemo(() => {
        return adminTeamPermissions?.rolePermissions?.map((role: { id: string, name: string }) => {
            return {
                value: role.id,
                label: role.name.replace(/([A-Z])/g, ' $1').replace(/^\w/, (c: string) => c.toUpperCase()),
            };
        }).reverse() ?? [];
    }, [adminTeamPermissions]);

    const isSuperAdminSelected = useMemo(() => {
        if (!selectedRoleId) return false;
        const currentRole = adminTeamPermissions?.rolePermissions?.find((r: any) => r.id === selectedRoleId);
        return currentRole?.name === "superAdmin";
    }, [selectedRoleId, adminTeamPermissions]);

    const getDefaultPermissions = (roleId: string): any[] => {
        return adminTeamPermissions?.rolePermissions?.find((role: { id: string }) => role?.id === roleId)?.permissions || [];
    };

    const defaultPermissionIds = useMemo(() => {
        if (!selectedRoleId) return new Set<string>();
        const defaultPerms = getDefaultPermissions(selectedRoleId);
        return new Set<string>(defaultPerms.map((p: any) => p.id));
    }, [selectedRoleId, adminTeamPermissions]);

    const filteredSortedPermissionsList = useMemo(() => {
        const catalog = buildAdminPermissionCatalog(
            adminTeamPermissions?.permissions,
            adminTeamPermissions?.rolePermissions,
        );

        return sortAdminPermissionCatalog(catalog, defaultPermissionIds);
    }, [adminTeamPermissions, defaultPermissionIds]);

    const handleCustomPermissionToggle = (permissionId: string) => {
        const exists = formCustomPermissions.some((p: any) => p.id === permissionId);

        let updatedPermissions;
        if (exists) {
            updatedPermissions = formCustomPermissions.filter((p: any) => p.id !== permissionId);
        } else {
            updatedPermissions = [...formCustomPermissions, { id: permissionId, include: true }];
        }

        setValue("permissions", updatedPermissions);
    };

    const isSendingInvite = isSubmitting || inviteTeamMemberMutation.isPending;

    const onSubmit = handleSubmit(async ({ permissions, ...formValues }) => {
        const payload = formCustomPermissions.length > 0 ? { ...formValues, permissions: formCustomPermissions } : formValues;
        await inviteTeamMemberMutation.mutateAsync(payload as any);
    });

    return (
        <div className="flex max-h-[90vh] flex-col bg-[#FFFFFF]">
            <div className="px-4 pt-5 md:px-6 md:pt-6">
                <div className="flex items-center gap-3 border-b border-[#0B0E0514] pb-4 md:justify-between md:gap-4">
                    <button
                        type="button"
                        aria-label="Close add team member modal"
                        onClick={onClose}
                        className="order-1 flex h-6 w-6 shrink-0 items-center justify-center text-[#98A2B3] transition-colors hover:text-[#667085] md:order-2"
                    >
                        <ModalCloseIcon className="h-5 w-5" />
                    </button>

                    <h2 className="order-2 flex-1 text-[18px] font-bold leading-tight text-[#101828] md:order-1 md:flex-none md:text-[20px]">
                        Add team member
                    </h2>
                </div>

                <p className="pt-4 text-sm leading-normal text-[#667085]">
                    Manage who can access the admin dashboard and what each member can do.
                </p>
            </div>

            <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit} noValidate>
                <div className="space-y-5 overflow-y-auto px-4 pb-2 pt-5 md:space-y-6 md:px-6 md:pt-6">
                    <AuthFormField
                        label="Email address"
                        hint="They'll get an email with a secure signup link."
                        type="email"
                        autoComplete="email"
                        placeholder={ADMIN_INVITE_EMAIL_PLACEHOLDER}
                        isRequired
                        showRequiredIndicator={showRequiredIndicator}
                        errorMessage={errors.email?.message}
                        disabled={isSendingInvite}
                        {...register("email")}
                    />

                    <Controller
                        name="roleId"
                        control={control}
                        render={({ field }) => (
                            <FormFilterDropdownField
                                label="Role"
                                hint="Choose what parts of the dashboard they can access."
                                value={field.value ?? "Select a role"}
                                options={adminTeamRolesOptions || []}
                                onChange={(val) => {
                                    field.onChange(val);
                                    setValue("permissions", []); // Reset custom configuration changes on structural swap
                                }}
                                isRequired
                                showRequiredIndicator={showRequiredIndicator}
                                errorMessage={errors.roleId?.message}
                                disabled={isSendingInvite}
                                testId="add-team-member-role"
                                menuTestId="add-team-member-role-menu"
                                optionTestIdPrefix="add-team-member-role-option"
                            />
                        )}
                    />

                    {selectedRoleId && (
                        <div className="space-y-2.5 pt-1">
                            <label className="text-sm font-semibold text-[#344054]">
                                Permissions
                            </label>

                            {isLoadingAdminTeamPermissions ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 animate-pulse">
                                    {[1, 2, 3, 4].map((n) => (
                                        <div key={n} className="h-4 bg-slate-100 rounded w-2/3" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                                    {filteredSortedPermissionsList.map((permission: any) => {
                                        const isDefault = defaultPermissionIds.has(permission.id);
                                        const description = permission.description ? permission.description.trim() : "no description";

                                        const isCustomChecked = formCustomPermissions.some((p: any) => p.id === permission.id);
                                        const shouldBeChecked = isSuperAdminSelected || isDefault || isCustomChecked;
                                        const isReadOnly = isSuperAdminSelected || isDefault;
                                        const formattedTitle = formatAdminPermissionLabel(permission);

                                        return (
                                            <div key={permission.id} className="flex items-center gap-3 py-0.5">
                                                <input
                                                    id={`permission-checkbox-${permission.id}`}
                                                    type="checkbox"
                                                    checked={shouldBeChecked}
                                                    readOnly={isReadOnly}
                                                    onChange={!isReadOnly ? () => handleCustomPermissionToggle(permission.id) : undefined}
                                                    title={`Description: ${description}`}
                                                    className={`h-4 w-4 rounded border-[#D0D5DD] text-[#518300] focus:ring-[#518300]/30 transition-colors ${isReadOnly
                                                        ? "bg-slate-50 cursor-not-allowed opacity-75"
                                                        : "cursor-pointer"
                                                        }`}
                                                />
                                                <div className="flex flex-col min-w-0">
                                                    <label
                                                        htmlFor={`permission-checkbox-${permission.id}`}
                                                        className={`text-sm select-none truncate ${isReadOnly
                                                            ? "text-[#344054]/70 font-medium cursor-not-allowed"
                                                            : "text-[#344054] font-normal cursor-pointer hover:text-slate-900"
                                                            }`}
                                                    >
                                                        {formattedTitle}
                                                    </label>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <FormTextareaField
                        label="Optional message"
                        placeholder={ADMIN_INVITE_MESSAGE_PLACEHOLDER}
                        showRequiredIndicator={showRequiredIndicator}
                        disabled={isSendingInvite}
                        className="min-h-[132px]"
                        {...register("message")}
                    />
                </div>

                <div className="flex justify-end gap-3 px-4 pb-5 pt-3 md:px-6 md:pb-6 md:pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSendingInvite}
                        className="inline-flex min-w-[88px] items-center justify-center rounded-xl border border-[#D0D5DD] bg-[#FFFFFF] px-4 py-2.5 text-sm font-semibold text-[#344054] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60 md:min-w-[96px]"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={isSendingInvite}
                        className="inline-flex min-w-[132px] items-center justify-center rounded-xl bg-[#B1EC52] px-4 py-2.5 text-sm font-semibold text-[#0B0E05] transition-colors hover:bg-[#A5DC45] disabled:cursor-not-allowed disabled:opacity-60 md:min-w-[148px]"
                    >
                        {isSendingInvite ? "Please wait…" : "Send invitation"}
                    </button>
                </div>
            </form>
        </div>
    );
}